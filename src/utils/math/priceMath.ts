import { BigNumber } from "ethers";
import JSBD, { Decimal } from "jsbd";
import JSBI from "jsbi";
import invariant from "tiny-invariant";
import { DyDxMath } from "./dydxMath";
import { TickMath, invertPrice } from "./tickMath";
import { BN_ZERO } from "./constants";
import { tokenSwap } from "../types";

export function priceToString(price: Decimal): string {
    if (scale(price) < 3) return Number.parseFloat(price.toPrecision(5)).toString()
    return Number.parseFloat(price.toPrecision(6)).toString()
}

export function scale(price: JSBD): number {
    let stringArr = price.toString().split('.')
    return stringArr[0].length
}

export function precision(price: JSBD): number {
    let stringArr = price.toString().split('.')
    return stringArr[1].length
}

export function getMarketPriceAboveBelowString(limitStringPriceQuote: string, pairSelected: boolean, limitPriceOrder: boolean, tokenIn: tokenSwap, tokenOut: tokenSwap): string {
    if (parseFloat(limitStringPriceQuote) == 0) return '0.00% above Market Price'
    const basePrice = limitPriceOrder == (tokenIn.callId == 0)
                        ? tokenIn.USDPrice / tokenOut.USDPrice
                        : tokenOut.USDPrice / tokenIn.USDPrice
    const limitPrice = parseFloat(limitStringPriceQuote) 
    let priceString
    if(pairSelected && !isNaN(parseFloat(limitStringPriceQuote))) {
        const percentDiff = parseFloat((limitPrice / basePrice * 100).toFixed(2))
        if (percentDiff >= 100) {
            priceString = (percentDiff - 100).toFixed(2) + "% above Market Price"
        } else {
            priceString = (100 - percentDiff).toFixed(2) + "% below Market Price"
        }
    } else {
        priceString = "0.00% above Market Price"
    }
    return priceString
}

/**
 * Returns the average price given [price range], [zeroForOne], and [amountIn]
 * @param lowerTick the lower tick of the price range
 * @param upperTick the upper tick of the price range
 * @param zeroForOne true if token0 => token1; false if token1 => token0
 * @param amountIn the amount of token deposited into the LP position
 */
export function getAveragePrice(lowerTick: number, upperTick: number, zeroForOne: boolean, liquidity: BigNumber, amountIn: BigNumber): number {
    if(
        lowerTick >= upperTick ||
        lowerTick < TickMath.MIN_TICK ||
        lowerTick > TickMath.MAX_TICK ||
        upperTick < TickMath.MIN_TICK ||
        upperTick > TickMath.MAX_TICK
    ) {
        return 0;
    }

    const amount = JSBI.BigInt(amountIn.div(2).toString())
    const liquidityAmount = JSBI.BigInt(liquidity.toString())

    let newSqrtPrice
    if (zeroForOne) {
        // start from lower price
        const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(lowerTick)
        newSqrtPrice = TickMath.getNewSqrtPrice(lowerSqrtPrice, liquidityAmount, amount, !zeroForOne, true)
    } else {
        // start from upper price
        const upperSqrtPrice = TickMath.getSqrtRatioAtTick(upperTick)
        newSqrtPrice = TickMath.getNewSqrtPrice(upperSqrtPrice, liquidityAmount, amount, !zeroForOne, true)
    }
    // convert sqrt price to price string
    return parseFloat(TickMath.getPriceStringAtSqrtPrice(newSqrtPrice))
}

/**
 * Returns the expected amount out when the range is 100% crossed
 * @param lowerTick the lower tick of the price range
 * @param upperTick the upper tick of the price range
 * @param zeroForOne true if token0 => token1; false if token1 => token0
 * @param amountIn the amount of token deposited into the LP position
 */
export function getExpectedAmountOutFromInput(lowerTick: number, upperTick: number, zeroForOne: boolean, amountIn: BigNumber): BigNumber {
    if(
        lowerTick >= upperTick ||
        TickMath.MIN_TICK > lowerTick ||
        TickMath.MAX_TICK < lowerTick ||
        TickMath.MIN_TICK > upperTick || 
        TickMath.MAX_TICK < upperTick
    ) {
        return BN_ZERO
    }
    if (!amountIn || amountIn.eq(BN_ZERO)) return BN_ZERO
    const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(Number(lowerTick))
    const upperSqrtPrice = TickMath.getSqrtRatioAtTick(Number(upperTick))
    const liquidityAmount = BigNumber.from(String(DyDxMath.getLiquidityForAmounts(
        lowerSqrtPrice,
        upperSqrtPrice,
        zeroForOne ? lowerSqrtPrice
                   : upperSqrtPrice,
        zeroForOne ? BN_ZERO
                   : amountIn,
        zeroForOne ? amountIn 
                   : BN_ZERO
    )))
    return getExpectedAmountOut(
        lowerTick,
        upperTick,
        zeroForOne,
        liquidityAmount
    )
}

/**
 * Returns the expected amount out when the range is 100% crossed
 * @param lowerTick the lower tick of the price range
 * @param upperTick the upper tick of the price range
 * @param zeroForOne true if token0 => token1; false if token1 => token0
 * @param amountIn the amount of token deposited into the LP position
 */
export function getExpectedAmountOut(lowerTick: number, upperTick: number, zeroForOne: boolean, liquidity: BigNumber): BigNumber {
    if(
        lowerTick >= upperTick ||
        lowerTick < TickMath.MIN_TICK ||
        lowerTick > TickMath.MAX_TICK ||
        upperTick < TickMath.MIN_TICK ||
        upperTick > TickMath.MAX_TICK
    ) {
        return BN_ZERO;
    }
    const liquidityAmount = JSBI.BigInt(liquidity.toString())
    const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(lowerTick)
    const upperSqrtPrice = TickMath.getSqrtRatioAtTick(upperTick)

    let newSqrtPrice
    if (zeroForOne) {
    // get amount1 at upper price
    return BigNumber.from(String(DyDxMath.getDy(liquidityAmount, lowerSqrtPrice, upperSqrtPrice, true)))
    } else {
    // get amount0 at lower price
    return BigNumber.from(String(DyDxMath.getDx(liquidityAmount, lowerSqrtPrice, upperSqrtPrice, true)))
    }
}