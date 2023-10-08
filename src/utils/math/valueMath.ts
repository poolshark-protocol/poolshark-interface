import { BigNumber, ethers } from "ethers"
import inputFilter from "../inputFilter"
import { BN_ZERO } from "./constants"

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

export function inputHandler(e): [string, string, BigNumber] {
    const result = inputFilter(e.target.value);

    if (result == '') {
        // handle empty value
        return [e.target.name, e.target.value, BN_ZERO];
    } else {
        return [
            e.target.name,
            result,
            ethers.utils.parseUnits(result, 18)
        ];
    }
}