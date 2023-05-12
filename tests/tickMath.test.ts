import JSBI from 'jsbi';
import { TickMath } from '../src/utils/math/tickMath'

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
    const priceString1 = TickMath.getPriceStringAtSqrtPrice(JSBI.BigInt('79228162514264337593543950336'))
    // check priceString
    expect(priceString1).toStrictEqual('1.00000e+0')
    // check sqrtPrice at priceString
    expect(TickMath.getSqrtPriceAtPriceString(priceString1)).toStrictEqual(sqrtPrice1);
  });
});