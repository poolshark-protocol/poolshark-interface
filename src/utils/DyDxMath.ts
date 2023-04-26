import JSBI from 'jsbi';
import { mulDiv, mulDivRoundingUp, divRoundingUp } from './PrecisionMath';

const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));

export abstract class DyDxMath {
  /**
   * Cannot be constructed.
   */
  private constructor() {}

  public static getDy(
    liquidity: JSBI,
    priceLower: JSBI,
    priceUpper: JSBI,
    roundUp: boolean
  ): JSBI {
    return DyDxMath._getDy(liquidity, priceLower, priceUpper, roundUp);
  }

  public static getDx(
    liquidity: JSBI,
    priceLower: JSBI,
    priceUpper: JSBI,
    roundUp: boolean
  ): JSBI {
    return DyDxMath._getDx(liquidity, priceLower, priceUpper, roundUp);
  }

  private static _getDy(
    liquidity: JSBI,
    priceLower: JSBI,
    priceUpper: JSBI,
    roundUp: boolean
  ): JSBI {
    let dy: JSBI;
    const difference = JSBI.subtract(priceUpper, priceLower);
    if (roundUp) {
      dy = mulDivRoundingUp(liquidity, difference, Q96);
    } else {
      dy = mulDiv(liquidity, difference, Q96);
    }
    return dy;
  }

  private static _getDx(
    liquidity: JSBI,
    priceLower: JSBI,
    priceUpper: JSBI,
    roundUp: boolean
  ): JSBI {
    let dx: JSBI;
    const difference = JSBI.subtract(priceUpper, priceLower);
    if (roundUp) {
      dx = divRoundingUp(
        mulDivRoundingUp(JSBI.leftShift(liquidity, JSBI.BigInt(96)), difference, priceUpper),
        priceLower
      );
    } else {
      dx = JSBI.divide(
        mulDiv(JSBI.leftShift(liquidity, JSBI.BigInt(96)), difference, priceUpper),
        priceLower
      );
    }
    return dx;
  }

  public static getLiquidityForAmounts(
    priceLower: JSBI,
    priceUpper: JSBI,
    currentPrice: JSBI,
    dy: JSBI,
    dx: JSBI
  ): JSBI {
    let liquidity: JSBI;
    if (JSBI.lessThanOrEqual(priceUpper, currentPrice)) {
      liquidity = mulDiv(dy, Q96, JSBI.subtract(priceUpper, priceLower));
    } else if (JSBI.lessThanOrEqual(currentPrice, priceLower)) {
      liquidity = mulDiv(
        dx,
        mulDiv(priceLower, priceUpper, Q96),
        JSBI.subtract(priceUpper, priceLower)
      );
    } else {
      const liquidity0 = mulDiv(
        dx,
        mulDiv(priceUpper, currentPrice, Q96),
        JSBI.subtract(priceUpper, currentPrice)
      );
      const liquidity1 = mulDiv(dy, Q96, JSBI.subtract(currentPrice, priceLower));
      liquidity = JSBI.lessThan(liquidity0, liquidity1) ? liquidity0 : liquidity1;
    }
    return liquidity;
  }

    public static getAmountsForLiquidity(
    priceLower: JSBI,
    priceUpper: JSBI,
    currentPrice: JSBI,
    liquidityAmount: JSBI,
    roundUp: boolean
  ): { token0amount: JSBI; token1amount: JSBI } {
    let token0amount: JSBI;
    let token1amount: JSBI;
    if (JSBI.lessThanOrEqual(currentPrice, priceLower)) {
      // token0 (X) is supplied
      token0amount = DyDxMath._getDx(liquidityAmount, priceLower, priceUpper, roundUp);
    } else if (JSBI.lessThanOrEqual(priceUpper, currentPrice)) {
      // token1 (y) is supplied
      token1amount = DyDxMath._getDy(liquidityAmount, priceLower, priceUpper, roundUp);
    } else {
      // Both token0 (x) and token1 (y) are supplied
      token0amount = DyDxMath._getDx(liquidityAmount, currentPrice, priceUpper, roundUp);
      token1amount = DyDxMath._getDy(liquidityAmount, priceLower, currentPrice, roundUp);
    }
    return { token0amount, token1amount };
  }
}
