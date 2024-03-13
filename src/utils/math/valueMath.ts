import { BigNumber, ethers } from "ethers"
import inputFilter from "../inputFilter"
import { BN_ZERO } from "./constants"
import { token } from "../types"

export const numFormat = (num, precision: number) =>
  `${1 * parseFloat(Number(num).toPrecision(precision))}`;

export const numStringFormat = (numString: string, precision: number, fixed?: number): string => {
  if (isNaN(parseFloat(numString))) return "0.00";
  if (parseFloat(numString) < 1) return `${1 * parseFloat(parseFloat(numString).toFixed(fixed))}`;
  return `${1 * parseFloat(parseFloat(numString).toPrecision(precision))}`;
}

export const formatOFin = (numString: string, fixed: number): string => {
  if (isNaN(parseFloat(numString))) return "0.00";
  if (parseFloat(numString) < 1) return `${1 * parseFloat(parseFloat(numString).toFixed(fixed))}`;
  else return `${1 * parseFloat(parseFloat(numString).toFixed(2))}`;
}

export function formatUsdValue(usdValueString: string): string {
    const usdValue = parseFloat(usdValueString)
    if (usdValue >= 1e12) {
        return (usdValue / 1e12).toFixed(2).concat('t')
    } else if (usdValue >= 1e9) {
        return (usdValue / 1e9).toFixed(2).concat('b')
    } else if (usdValue >= 1e6) {
        return (usdValue / 1e6).toFixed(2).concat('m')
    } else if (usdValue >= 1e3) {
        return (usdValue / 1e3).toFixed(2).concat('k')
    }
    return usdValue.toFixed(2)
}

export function inputHandler(e, token: token, skipFilter?: boolean): [string, BigNumber] {
    const result = skipFilter ? e.target.value : inputFilter(e.target.value);

    if (result == '') {
        // handle empty value
        return [e.target.value, BN_ZERO];
    } else {
        return [
            result,
            parseUnits(result, token.decimals)
        ];
    }
}

export function getFeeApy(rangePool: any): string {
  if (!rangePool.tvlUsd || rangePool.tvlUsd == 0) return "0.00"
  return ((rangePool.feesUsd ?? 0) * 365 / (rangePool.tvlUsd) * 100).toFixed(2)
}

export function parseUnits(value: string, decimals: number): BigNumber {
  const floatValue = parseFloat(value)
  if (isNaN(floatValue)) return BN_ZERO
  if (floatValue.toString().indexOf('.') != -1 && floatValue.toString().indexOf('e-') != -1) {
    // example: 1.36e-7
    const decimalCount = (floatValue.toString().split('e-')[0]).split('.')[1].length
    const exponentialCount = Number(floatValue.toString().split('e-')[1])
    const decimalPlaces = decimalCount + exponentialCount
    if (decimalPlaces > decimals || decimalPlaces >= 16) {
      value = floatValue.toFixed(decimals)
    } else {
      value = floatValue.toFixed(decimalPlaces)
    }
  } else if (floatValue.toString().indexOf('.') != -1) {
    // example: 1.36
    const decimalPlaces = floatValue.toString().split('.')[1].length
    if (decimalPlaces > decimals || decimalPlaces >= 16) value = floatValue.toFixed(decimals)
  } else if (floatValue.toString().indexOf('e-') != -1) {
    // example: 1e-7
    const decimalPlaces = Number(floatValue.toString().split('e-')[1])
    if (decimalPlaces > decimals || decimalPlaces >= 16) {
      value = floatValue.toFixed(decimals)
    } else {
      value = floatValue.toFixed(decimalPlaces)
    }
  } else {
    // if float is 1.[15]1 parseFloat will round to 1
    // thus we truncate using fixed decimals
    value = floatValue.toFixed(decimals)
   }
  return ethers.utils.parseUnits(value, decimals)
}