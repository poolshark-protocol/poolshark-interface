import JSBI from 'jsbi'
import { ONE, ZERO } from './constants'

export abstract class PrecisionMath {
  /**
   * Cannot be constructed.
   */
  private constructor() {}

  public static mulDiv(a: JSBI, b: JSBI, denominator: JSBI): JSBI {
    const product = JSBI.multiply(a, b)
    let result = JSBI.divide(product, denominator)
    return result
  }

  public static div(numerator: JSBI, denominator: JSBI): JSBI {
    let result = JSBI.divide(numerator, denominator)
    return result
  }

  public static mulDivRoundingUp(a: JSBI, b: JSBI, denominator: JSBI): JSBI {
    const product = JSBI.multiply(a, b)
    let result = JSBI.divide(product, denominator)
    if (JSBI.notEqual(JSBI.remainder(product, denominator), ZERO)) result = JSBI.add(result, ONE)
    return result
  }

  public static divRoundingUp(numerator: JSBI, denominator: JSBI): JSBI {
    let result = JSBI.divide(numerator, denominator)
    if (JSBI.notEqual(JSBI.remainder(numerator, denominator), ZERO)) result = JSBI.add(result, ONE)
    return result
  }
}