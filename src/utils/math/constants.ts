import JSBD from 'jsbd'
import JSBI from 'jsbi'

// constants used internally but not expected to be used externally
export const NEGATIVE_ONE = JSBI.BigInt(-1)
export const ZERO = JSBI.BigInt(0)
export const ONE = JSBI.BigInt(1)
export const MAX_UINT256 = JSBI.subtract(JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(256)), JSBI.BigInt(1))

// used in tick to price math
export const Q32 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(32))

// used in liquidity amount math
export const Q96_BI = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96))
export const Q96_BD = JSBD.pow(JSBD.BigDecimal(2), 96)
export const Q192 = JSBI.exponentiate(Q96_BI, JSBI.BigInt(2))