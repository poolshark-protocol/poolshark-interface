import JSBI from 'jsbi'
import invariant from 'tiny-invariant'
import { Q32, ONE, ZERO, MAX_UINT256, Q96_BD  } from './constants'
import { mostSignificantBit } from "./mostSignificantBit"
import JSBD from 'jsbd'
import { priceToString, scale } from './priceMath'
import { BigNumber } from 'ethers'
import { PrecisionMath } from './precisionMath'
import { DyDxMath } from './dydxMath'
import { token, tokenCover, tokenRangeLimit, tokenSwap } from '../types'

function mulShift(val: JSBI, mulBy: string): JSBI {
  return JSBI.signedRightShift(JSBI.multiply(val, JSBI.BigInt(mulBy)), JSBI.BigInt(128))
}

export function roundTick(tick: number, tickSpacing: number): number {
  let minTick = Math.round(TickMath.MIN_TICK / tickSpacing) * tickSpacing
  let maxTick = Math.round(TickMath.MAX_TICK / tickSpacing) * tickSpacing
  if (minTick < TickMath.MIN_TICK) minTick -= -tickSpacing;
  if (maxTick > TickMath.MAX_TICK) maxTick -= tickSpacing;
  if (tick % tickSpacing != 0) {
    let roundedDown = Math.round(tick / tickSpacing) * tickSpacing;
    let roundedUp = Math.round(tick / tickSpacing) * tickSpacing - (-tickSpacing);
    // check which is closer
    if (tick - roundedDown <= roundedUp - tick) {
      if (roundedDown < minTick) return minTick
      if (roundedDown > maxTick) return maxTick
      return roundedDown
    } else {
      if (roundedUp < minTick) return minTick
      if (roundedUp > maxTick) return maxTick
      return roundedUp
    }
  }
  return tick;
}

export function invertPrice(priceString: string, zeroForOne: boolean): string {
  if (isNaN(parseFloat(priceString)) || parseFloat(priceString) == 0) return '0.00'
  if(!zeroForOne) {
    let price = JSBD.BigDecimal(priceString)
    price = JSBD.divide(JSBD.BigDecimal('1.00'), price)
    priceString = priceToString(price)
  }
  return priceString
}

export function roundPrice(priceString: string, tokenA: token, tokenB: token, tickSpacing: number): string {
  if (isNaN(parseFloat(priceString)) || parseFloat(priceString) == 0 || isNaN(tickSpacing)) return '0.00'
  const tick = TickMath.getTickAtPriceString(priceString, tokenA, tokenB, tickSpacing)
  return TickMath.getPriceStringAtTick(tick, tokenA, tokenB, tickSpacing)
}

export function getDefaultLowerTick(minLimit, maxLimit, zeroForOne, latestTick = 0): number {
  const midTick = Math.round((Number(minLimit) + Number(maxLimit)) / 2)
  if (zeroForOne) {
    if (latestTick < minLimit) return latestTick - 10000
    if (midTick - minLimit > 10000) return midTick - 10000
    return minLimit
  } else {
    if (latestTick < minLimit) return minLimit
    return latestTick
  }
}

export function getDefaultUpperTick(minLimit, maxLimit, zeroForOne, latestTick = 0): number {
  const midTick = Math.round(Number(minLimit) + Number(maxLimit) / 2)
  if (!zeroForOne) {
    if (latestTick > maxLimit) return latestTick - -10000
    if (maxLimit - midTick > 10000) return midTick - -10000
    return maxLimit  
  } else {
    if (latestTick > midTick) return midTick
    return latestTick
  }
}

export function getDefaultLowerPrice(minLimit, maxLimit, zeroForOne, tokenA: token, tokenB: token, latestTick = 0): string {
  return TickMath.getPriceStringAtTick(getDefaultLowerTick(minLimit, maxLimit, zeroForOne, latestTick), tokenA, tokenB)
}

export function getDefaultUpperPrice(minLimit, maxLimit, zeroForOne, tokenA: token, tokenB: token, latestTick = 0): string {
  return TickMath.getPriceStringAtTick(getDefaultUpperTick(minLimit, maxLimit, zeroForOne, latestTick), tokenA, tokenB)
}

export const minPriceBn: BigNumber = BigNumber.from('4295128739')
export const maxPriceBn: BigNumber = BigNumber.from('1461446703485210103287273052203988822378723970342')

export abstract class TickMath {
  /**
   * Cannot be constructed.
   */
  private constructor() {}

  /**
   * The minimum tick that can be used on any pool.
   */
  public static MIN_TICK: number = -887272
  /**
   * The maximum tick that can be used on any pool.
   */
  public static MAX_TICK: number = -TickMath.MIN_TICK

  /**
   * The sqrt ratio corresponding to the minimum tick that could be used on any pool.
   */
  public static MIN_SQRT_RATIO: JSBI = JSBI.BigInt('4295128739')
  /**
   * The sqrt ratio corresponding to the maximum tick that could be used on any pool.
   */
  public static MAX_SQRT_RATIO: JSBI = JSBI.BigInt('1461446703485210103287273052203988822378723970342')

  public static getPriceStringAtTick(tick: number, tokenA: token, tokenB: token, tickSpacing?: number): string {
    if (isNaN(tick)) return '0.00'

    // round the tick based on tickSpacing
    let roundedTick = tick
    if (tickSpacing) roundedTick = roundTick(Number(tick), tickSpacing)
    // divide and return formatted string
    const priceString = this.getPriceStringAtSqrtPrice(this.getSqrtRatioAtTick(roundedTick), tokenA, tokenB)
    return priceString
  }

  public static getSqrtPriceAtPriceString(priceString: string, tokenA: token, tokenB: token, tickSpacing?: number): JSBI {
    let price = Number(parseFloat(priceString).toFixed(30))
    // scale price based on token decimals
    const token0 = tokenA.address.localeCompare(tokenB.address) < 0 ? tokenA : tokenB
    const token1 = token0.address == tokenA.address ? tokenB : tokenA
    const decimalDiff = !isNaN(token0.decimals) && !isNaN(token1.decimals) ? token0.decimals - token1.decimals : 0;
    price = price / (10 ** (decimalDiff))
    let sqrtPrice = JSBI.divide(
      JSBI.multiply(
        JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96)),
        JSBI.BigInt(
          String(
            Math.sqrt(price).toFixed(
              30,
            ),
          )
            .split('.')
            .join(''),
        ),
      ),
      JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(30)),
    )
    if (JSBI.lessThan(sqrtPrice, TickMath.MIN_SQRT_RATIO)) return TickMath.MIN_SQRT_RATIO
    if (JSBI.greaterThan(sqrtPrice, TickMath.MAX_SQRT_RATIO)) return TickMath.MAX_SQRT_RATIO
    return sqrtPrice
  }

  public static getPriceStringAtSqrtPrice(sqrtPrice: JSBI, tokenA: token, tokenB: token): string {
    const sqrtPriceBD = JSBD.BigDecimal(sqrtPrice.toString())
    // square sqrtPrice
    const sqrtPriceExp = JSBD.pow(sqrtPriceBD, 2)
    // square Q96 value
    const Q96Exp = JSBD.pow(Q96_BD, 2)
    // divide by Q96
    let price = JSBD.divide(sqrtPriceExp, Q96Exp)
    // scale based on decimal difference

    const token0 = tokenA?.address.localeCompare(tokenB?.address) < 0 ? tokenA : tokenB
    const token1 = token0?.address == tokenA?.address ? tokenB : tokenA
    const decimalDiff = !isNaN(token0?.decimals) && !isNaN(token1?.decimals) ? token0.decimals - token1.decimals : 0;
    if (decimalDiff > 0) {
      // multiply for positive diff
      const decimalFactor = JSBD.pow(JSBD.BigDecimal(10), decimalDiff)
      price = JSBD.multiply(price, decimalFactor)
    } else if (decimalDiff < 0) {
      // divide for negative diff
      const decimalFactor = JSBD.pow(JSBD.BigDecimal(10), -decimalDiff)
      price = JSBD.divide(price, decimalFactor)
    }
    // prices greater than 100k use scientific notation
    if (JSBD.greaterThanOrEqual(price, JSBD.BigDecimal(100000)))
      return price.toExponential(3).toString()
    // prices less than 0.00001 use scientific notation
    else if (JSBD.lessThanOrEqual(price, JSBD.BigDecimal(0.01)))
      return price.toExponential(3).toString()
    // normal display for other prices
    else
      return priceToString(price)
  }

  public static getTickAtPriceString(priceString: string, tokenA: token, tokenB: token, tickSpacing?: number): number {
    const price = parseFloat(priceString)
    if (isNaN(price)) return this.MIN_TICK
    const minPrice = parseFloat(this.getPriceStringAtTick(this.MIN_TICK, tokenA, tokenB))
    const maxPrice = parseFloat(this.getPriceStringAtTick(this.MAX_TICK, tokenA, tokenB))
    let tick;
    if (price <= minPrice) {
      tick = this.MIN_TICK
    } else if (price >= maxPrice) {
      tick = this.MAX_TICK
    } else {
      let sqrtPrice = this.getSqrtPriceAtPriceString(priceString, tokenA, tokenB)
      if (JSBI.lessThan(sqrtPrice, this.MIN_SQRT_RATIO)){ return this.MIN_TICK}
      if (JSBI.greaterThan(sqrtPrice, this.MAX_SQRT_RATIO)) return this.MAX_TICK
      tick = this.getTickAtSqrtRatio(sqrtPrice)
    }
    if (tickSpacing){
      return roundTick(tick, tickSpacing)
    } 
    else return tick
  }

  /**
   * Returns the sqrt ratio as a Q64.96 for the given tick. The sqrt ratio is computed as sqrt(1.0001)^tick
   * @param tick the tick for which to compute the sqrt ratio
   */
  public static getSqrtRatioAtTick(tick: number): JSBI {
    if(tick <= TickMath.MIN_TICK) return this.MIN_SQRT_RATIO
    if(tick >= TickMath.MAX_TICK) return this.MAX_SQRT_RATIO
    const absTick: number = tick < 0 ? tick * -1 : tick

    let ratio: JSBI =
      (absTick & 0x1) != 0
        ? JSBI.BigInt('0xfffcb933bd6fad37aa2d162d1a594001')
        : JSBI.BigInt('0x100000000000000000000000000000000')
    if ((absTick & 0x2) != 0) ratio = mulShift(ratio, '0xfff97272373d413259a46990580e213a')
    if ((absTick & 0x4) != 0) ratio = mulShift(ratio, '0xfff2e50f5f656932ef12357cf3c7fdcc')
    if ((absTick & 0x8) != 0) ratio = mulShift(ratio, '0xffe5caca7e10e4e61c3624eaa0941cd0')
    if ((absTick & 0x10) != 0) ratio = mulShift(ratio, '0xffcb9843d60f6159c9db58835c926644')
    if ((absTick & 0x20) != 0) ratio = mulShift(ratio, '0xff973b41fa98c081472e6896dfb254c0')
    if ((absTick & 0x40) != 0) ratio = mulShift(ratio, '0xff2ea16466c96a3843ec78b326b52861')
    if ((absTick & 0x80) != 0) ratio = mulShift(ratio, '0xfe5dee046a99a2a811c461f1969c3053')
    if ((absTick & 0x100) != 0) ratio = mulShift(ratio, '0xfcbe86c7900a88aedcffc83b479aa3a4')
    if ((absTick & 0x200) != 0) ratio = mulShift(ratio, '0xf987a7253ac413176f2b074cf7815e54')
    if ((absTick & 0x400) != 0) ratio = mulShift(ratio, '0xf3392b0822b70005940c7a398e4b70f3')
    if ((absTick & 0x800) != 0) ratio = mulShift(ratio, '0xe7159475a2c29b7443b29c7fa6e889d9')
    if ((absTick & 0x1000) != 0) ratio = mulShift(ratio, '0xd097f3bdfd2022b8845ad8f792aa5825')
    if ((absTick & 0x2000) != 0) ratio = mulShift(ratio, '0xa9f746462d870fdf8a65dc1f90e061e5')
    if ((absTick & 0x4000) != 0) ratio = mulShift(ratio, '0x70d869a156d2a1b890bb3df62baf32f7')
    if ((absTick & 0x8000) != 0) ratio = mulShift(ratio, '0x31be135f97d08fd981231505542fcfa6')
    if ((absTick & 0x10000) != 0) ratio = mulShift(ratio, '0x9aa508b5b7a84e1c677de54f3e99bc9')
    if ((absTick & 0x20000) != 0) ratio = mulShift(ratio, '0x5d6af8dedb81196699c329225ee604')
    if ((absTick & 0x40000) != 0) ratio = mulShift(ratio, '0x2216e584f5fa1ea926041bedfe98')
    if ((absTick & 0x80000) != 0) ratio = mulShift(ratio, '0x48a170391f7dc42444e8fa2')

    if (tick > 0) ratio = JSBI.divide(MAX_UINT256 , ratio)

    // back to Q96
    return JSBI.greaterThan(JSBI.remainder(ratio, Q32), ZERO)
      ? JSBI.add(JSBI.divide(ratio, Q32), ONE)
      : JSBI.divide(ratio, Q32)
  }

  /**
   * Returns the tick corresponding to a given sqrt ratio, s.t. #getSqrtRatioAtTick(tick) <= sqrtRatioX96
   * and #getSqrtRatioAtTick(tick + 1) > sqrtRatioX96
   * @param sqrtRatioX96 the sqrt ratio as a Q64.96 for which to compute the tick
   */
  public static getTickAtSqrtRatio(sqrtRatioX96: JSBI): number {
    if(JSBI.lessThan(sqrtRatioX96, TickMath.MIN_SQRT_RATIO))
      sqrtRatioX96 = TickMath.MIN_SQRT_RATIO
    else if(JSBI.greaterThan(sqrtRatioX96, TickMath.MAX_SQRT_RATIO))
      sqrtRatioX96 = TickMath.MAX_SQRT_RATIO
    const sqrtRatioX128 = JSBI.leftShift(sqrtRatioX96, JSBI.BigInt(32))

    const msb = mostSignificantBit(sqrtRatioX128)

    let r: JSBI
    if (JSBI.greaterThanOrEqual(JSBI.BigInt(msb), JSBI.BigInt(128))) {
      r = JSBI.signedRightShift(sqrtRatioX128, JSBI.BigInt(msb - 127))
    } else {
      r = JSBI.leftShift(sqrtRatioX128, JSBI.BigInt(127 - msb))
    }

    let log_2: JSBI = JSBI.leftShift(JSBI.subtract(JSBI.BigInt(msb), JSBI.BigInt(128)), JSBI.BigInt(64))

    for (let i = 0; i < 14; i++) {
      r = JSBI.signedRightShift(JSBI.multiply(r, r), JSBI.BigInt(127))
      const f = JSBI.signedRightShift(r, JSBI.BigInt(128))
      log_2 = JSBI.bitwiseOr(log_2, JSBI.leftShift(f, JSBI.BigInt(63 - i)))
      r = JSBI.signedRightShift(r, f)
    }

    const log_sqrt10001 = JSBI.multiply(log_2, JSBI.BigInt('255738958999603826347141'))

    const tickLow = JSBI.toNumber(
      JSBI.signedRightShift(
        JSBI.subtract(log_sqrt10001, JSBI.BigInt('3402992956809132418596140100660247210')),
        JSBI.BigInt(128)
      )
    )
    const tickHigh = JSBI.toNumber(
      JSBI.signedRightShift(
        JSBI.add(log_sqrt10001, JSBI.BigInt('291339464771989622907027621153398088495')),
        JSBI.BigInt(128)
      )
    )

    return tickLow === tickHigh
      ? tickLow
      : JSBI.lessThanOrEqual(TickMath.getSqrtRatioAtTick(tickHigh), sqrtRatioX96)
      ? tickHigh
      : tickLow
  }

  public static getNewSqrtPrice(sqrtPrice: JSBI, liquidity: JSBI, amount: JSBI, zeroForOne: boolean, exactIn: boolean): JSBI {
    if (exactIn) {
      if (zeroForOne) {
        const liquidityPadded = JSBI.leftShift(liquidity, JSBI.BigInt(96))
        return PrecisionMath.mulDivRoundingUp(
          liquidityPadded,
          sqrtPrice,
          JSBI.add(liquidityPadded, JSBI.multiply(sqrtPrice, amount))
        )
      } else {
        return JSBI.add(sqrtPrice, JSBI.divide(JSBI.leftShift(amount, JSBI.BigInt(96)), liquidity))
      }
    } else {
      if (zeroForOne) {
        return JSBI.subtract(sqrtPrice, PrecisionMath.divRoundingUp(JSBI.leftShift(amount, JSBI.BigInt(96)), liquidity))
      } else {
        const liquidityPadded = JSBI.leftShift(liquidity, JSBI.BigInt(96))
        return PrecisionMath.mulDivRoundingUp(
          liquidityPadded,
          sqrtPrice,
          JSBI.subtract(liquidityPadded, JSBI.multiply(sqrtPrice, amount))
        )
      }
    }
  }


}