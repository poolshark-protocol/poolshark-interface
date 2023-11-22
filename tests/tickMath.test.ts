import JSBI from 'jsbi';
import { TickMath, invertPrice } from '../src/utils/math/tickMath'
import { getAveragePrice, getExpectedAmountOut } from '../src/utils/math/priceMath';
import { BigNumber, ethers } from 'ethers';

describe('TickMath tests', () => {
  test('price string of 1.00 converts to tick 0', () => {
    expect(TickMath.getTickAtPriceString('1.00')).toBe(0);
  });

  test('price string of 1.01 converts to tick 99', () => {
    expect(TickMath.getTickAtPriceString('1.01')).toBe(99);
  });

  test('price string of 0.99 converts to tick -101', () => {
    expect(TickMath.getTickAtPriceString('0.99')).toBe(-101);
  });

  test('price string of 3000.00 converts to tick 80067', () => {
    expect(TickMath.getTickAtPriceString('3000.000000')).toBe(80067);
  });

  test('sqrt price for 1.00 converts to price string', () => {
    // equals sqrtPrice of 1.00
    const sqrtPrice1 = JSBI.BigInt('79228162514264337593543950336')
    // equals priceString of '1.00'
    const priceString1 = TickMath.getPriceStringAtSqrtPrice(sqrtPrice1)
    // check priceString
    expect(priceString1).toStrictEqual('1')
    // check sqrtPrice at priceString
    expect(TickMath.getSqrtPriceAtPriceString(priceString1)).toStrictEqual(sqrtPrice1);
  });

  test('price string at tick 84467 should be 4657.70', () => {

    const priceString1 = TickMath.getPriceStringAtTick(84467)

    expect(priceString1).toStrictEqual('4657.7')
  })

  test('price string for 2.00 inverts to 0.50', () => {
    const priceString2 = '2.00'
    const priceStringOneHalf = invertPrice(priceString2, false)
    // check priceString
    expect(priceStringOneHalf).toStrictEqual('0.5')
  });

  test('price string for 3.402e+38 converts to tick', () => {
    const priceString2 = TickMath.MAX_SQRT_RATIO
    const priceString = TickMath.getPriceStringAtSqrtPrice(priceString2)
    const tick = TickMath.getTickAtPriceString(priceString)
    // check priceString
    expect(tick).toStrictEqual(887272)
  });

  test('price string for 2.97e-39 converts to tick', () => {
    const priceString2 = TickMath.MIN_SQRT_RATIO
    const priceString = TickMath.getPriceStringAtSqrtPrice(priceString2)
    const tick = TickMath.getTickAtPriceString(priceString)
    // check priceString
    expect(tick).toStrictEqual(-887272)
  });

  test('position of tick 0 to 100 zeroForOne true gives expected price', () => {
    const lowerTick = 0
    const upperTick = 100
    const price = getAveragePrice(lowerTick, upperTick, true, BigNumber.from('20051041647900280328782'), parseUnits('100', 18))
    // check price
    expect(price).toStrictEqual(1.005)
  });

  test('position of tick 0 to 100 zeroForOne false gives expected price', () => {
    const lowerTick = -100
    const upperTick = 0
    const price = getAveragePrice(lowerTick, upperTick, false, BigNumber.from('20051041647900280328782'), parseUnits('100', 18))
    // check price
    expect(price).toStrictEqual(0.99503)
  });

  test('position of tick 0 to 100 zeroForOne false gives expected amount out', () => {
    const lowerTick = 0
    const upperTick = 100
    const amountOut = getExpectedAmountOut(lowerTick, upperTick, true, BigNumber.from('20051041647900280328782'))
    // check amount out
    expect(amountOut.toString()).toStrictEqual('100501226962305120351')
  });

  test('position of tick 0 to 100 zeroForOne false gives expected amount out', () => {
    const lowerTick = -100
    const upperTick = 0
    const amountOut = getExpectedAmountOut(lowerTick, upperTick, false, BigNumber.from('20051041647900280328782'))
    // check amount out
    expect(amountOut.toString()).toStrictEqual('100501226962305120351')
  });
});