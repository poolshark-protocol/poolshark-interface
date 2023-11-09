import { BigNumber, ethers } from "ethers"
import inputFilter from "../inputFilter"
import { BN_ZERO } from "./constants"
import { token } from "../types"

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

export function inputHandler(e, token: token): [string, BigNumber] {
    const result = inputFilter(e.target.value);

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

export function parseUnits(value: string, decimals: number): BigNumber {
  const floatValue = parseFloat(value)
  if (isNaN(floatValue)) return 
  if (floatValue.toString().indexOf('.') != -1 && floatValue.toString().indexOf('e-') != -1) {
    // example: 1.36e-7
    const decimalCount = (floatValue.toString().split('e-')[0]).split('.')[1].length
    const exponentialCount = Number(floatValue.toString().split('e-')[1])
    const decimalPlaces = decimalCount + exponentialCount
    if (decimalPlaces > decimals || decimalPlaces >= 16) value = floatValue.toFixed(decimals)
  } else if (floatValue.toString().indexOf('.') != -1) {
    // example: 1.36
    const decimalPlaces = floatValue.toString().split('.')[1].length
    if (decimalPlaces > decimals || decimalPlaces >= 16) value = floatValue.toFixed(decimals)
  } else if (floatValue.toString().indexOf('e-') != -1) {
    // example: 1e-7
    const decimalPlaces = Number(floatValue.toString().split('e-')[1])
    if (decimalPlaces > decimals || decimalPlaces >= 16) value = floatValue.toFixed(decimals)
  }
  return ethers.utils.parseUnits(value, decimals)
} 