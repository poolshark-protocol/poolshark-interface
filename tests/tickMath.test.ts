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
});