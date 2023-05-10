import JSBI from 'jsbi';
import { Q96_BI } from './constants'
import { PrecisionMath } from './precisionMath';

export abstract class DyDxMath {

  public static getDy(
    liquidity: JSBI,
    priceLower: JSBI,
    priceUpper: JSBI,
    roundUp: boolean
  ): JSBI {
    let dy: JSBI;
    const priceDiff = JSBI.subtract(priceUpper, priceLower);
    if (roundUp) {
      dy = PrecisionMath.mulDivRoundingUp(liquidity, priceDiff, Q96_BI);
    } else {
      dy = PrecisionMath.mulDiv(liquidity, priceDiff, Q96_BI);
    }
    return dy;
  }

  public static getDx(
    liquidity: JSBI,
    priceLower: JSBI,
    priceUpper: JSBI,
    roundUp: boolean
  ): JSBI {
    let dx: JSBI;
    const priceDiff = JSBI.subtract(priceUpper, priceLower);
    if (roundUp) {
      dx = PrecisionMath.divRoundingUp(
        PrecisionMath.mulDivRoundingUp(JSBI.leftShift(liquidity, JSBI.BigInt(96)), priceDiff, priceUpper),
        priceLower
      );
    } else {
      dx = PrecisionMath.div(
        PrecisionMath.mulDiv(JSBI.leftShift(liquidity, JSBI.BigInt(96)), priceDiff, priceUpper),
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
      liquidity = PrecisionMath.mulDivRoundingUp(dy, Q96_BI, JSBI.subtract(priceUpper, priceLower));
    } else if (JSBI.lessThanOrEqual(currentPrice, priceLower)) {
      liquidity = PrecisionMath.mulDivRoundingUp(
        dx,
        PrecisionMath.mulDivRoundingUp(priceLower, priceUpper, Q96_BI),
        JSBI.subtract(priceUpper, priceLower)
      );
    } else {
      const liquidity0 = PrecisionMath.mulDivRoundingUp(
        dx,
        PrecisionMath.mulDivRoundingUp(priceUpper, currentPrice, Q96_BI),
        JSBI.subtract(priceUpper, currentPrice)
      );
      const liquidity1 = PrecisionMath.mulDivRoundingUp(dy, Q96_BI, JSBI.subtract(currentPrice, priceLower));
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
      token0amount = DyDxMath.getDx(liquidityAmount, priceLower, priceUpper, roundUp);
    } else if (JSBI.lessThanOrEqual(priceUpper, currentPrice)) {
      // token1 (y) is supplied
      token1amount = DyDxMath.getDy(liquidityAmount, priceLower, priceUpper, roundUp);
    } else {
      // Both token0 (x) and token1 (y) are supplied
      token0amount = DyDxMath.getDx(liquidityAmount, currentPrice, priceUpper, roundUp);
      token1amount = DyDxMath.getDy(liquidityAmount, priceLower, currentPrice, roundUp);
    }
    return { token0amount, token1amount };
  }
}