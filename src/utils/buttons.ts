import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils.js";
import { BN_ZERO, ZERO_ADDRESS } from "./math/constants";
import { token } from "./types";

export function getRangeMintButtonMessage(
    tokenInAmount: BigNumber,
    tokenOutAmount: BigNumber,
    tokenIn: token,
    tokenOut: token,
    rangePoolAddress: string,
    startPrice: string
  ): string {
    if (tokenIn.userBalance < parseFloat(formatUnits(
            String(tokenInAmount),
            tokenIn.decimals
        )) ||
        tokenOut.userBalance < parseFloat(formatUnits(
            String(tokenOutAmount),
            tokenOut.decimals
        ))
    ) {
        return "Insufficient Token Balance"
    } else if (
        tokenInAmount.eq(BN_ZERO) && tokenOutAmount.eq(BN_ZERO)
    ) {
        return "Enter Amount"
    } else if (rangePoolAddress == ZERO_ADDRESS) {
        const priceStart = parseFloat(startPrice)
        if (isNaN(priceStart) || priceStart <= 0)
            // invalid start price
            return "Enter Start Price"
    } else {
        return "Mint Range Position"
    }
}

export function getRangeMintButtonDisabled(
    tokenInAmount: BigNumber,
    tokenOutAmount: BigNumber,
    tokenIn: token,
    tokenOut: token,
    rangePoolAddress: string,
    startPrice: string
  ): boolean {
    if (tokenIn.userBalance < parseFloat(formatUnits(
            String(tokenInAmount),
            tokenIn.decimals
        )) ||
        tokenOut.userBalance < parseFloat(formatUnits(
            String(tokenOutAmount),
            tokenOut.decimals
        ))
    ) {
        return true
    } else if (
        tokenInAmount.eq(BN_ZERO) && tokenOutAmount.eq(BN_ZERO)
    ) {
        return true
    } else if (rangePoolAddress == ZERO_ADDRESS) {
        const priceStart = parseFloat(startPrice)
        if (isNaN(priceStart) || priceStart <= 0)
            // invalid start price
            return true
    } else {
        return false
    }
}