import { BigNumber, ethers } from "ethers";
import { formatUnits } from "ethers/lib/utils.js";
import { BN_ONE, BN_ZERO, ONE, ZERO_ADDRESS } from "./math/constants";
import { token } from "./types";
import JSBI from "jsbi";

export function getLimitSwapButtonMsgValue(
  tokenInNative: boolean,
  amountIn: BigNumber,
): BigNumber {
  if (tokenInNative) {
    return amountIn;
  } else {
    return BN_ZERO;
  }
}

export function getCoverMintButtonMsgValue(
  tokenInNative: boolean,
  amountIn: BigNumber,
): BigNumber {
  if (tokenInNative) {
    return amountIn;
  } else {
    return BN_ZERO;
  }
}

export function getRangeMintButtonMsgValue(
  tokenInNative: boolean,
  tokenOutNative: boolean,
  amountIn: BigNumber,
  amountOut: BigNumber,
): BigNumber {
  if (tokenInNative) {
    return amountIn;
  } else if (tokenOutNative) {
    return amountOut;
  } else {
    return BN_ZERO;
  }
}

export function getRangeMintInputData(
  stakeFlag: boolean,
  stakeAddress: string,
): any {
  if (stakeFlag)
    return ethers.utils.defaultAbiCoder.encode(
      [
        {
          components: [
            {
              //@ts-ignore
              internalType: "address",
              name: "staker",
              type: "address",
            },
          ],
          name: "params",
          type: "tuple",
        },
      ],
      [
        {
          staker: stakeAddress,
        },
      ],
    );
  else return ethers.utils.formatBytes32String("");
}

export function getSwapRouterButtonMsgValue(
  tokenInNative: boolean,
  tokenOutNative: boolean,
  amountIn: BigNumber,
): BigNumber {
  if (tokenInNative) {
    return amountIn;
  } else if (tokenOutNative) {
    return BN_ONE;
  } else {
    return BN_ZERO;
  }
}

export function getTradeButtonMessage(
  tokenIn: token,
  tokenOut: token,
  amountIn: BigNumber,
  amountOut: BigNumber,
): string {
  const amountInValue: number = parseFloat(
    ethers.utils.formatUnits(String(amountIn), tokenIn.decimals),
  );
  const amountOutValue: number = parseFloat(
    ethers.utils.formatUnits(String(amountOut), tokenOut.decimals),
  );
  if (tokenIn.userBalance < amountInValue && tokenIn.address != ZERO_ADDRESS) {
    return "Low " + tokenIn.symbol + " Balance";
  } else if (amountInValue == 0) {
    return "Enter Amount";
  } else if (
    tokenIn.address == ZERO_ADDRESS ||
    tokenOut.address == ZERO_ADDRESS
  ) {
    return "Select Token";
  } else if (amountOutValue == 0) {
    return "Empty Quote";
  }
  return "";
}

export function getTradeButtonDisabled(
  tokenIn: token,
  tokenOut: token,
  amountIn: BigNumber,
  amountOut: BigNumber,
): boolean {
  const amountInValue: number = parseFloat(
    ethers.utils.formatUnits(String(amountIn), tokenIn.decimals),
  );
  const amountOutValue: number = parseFloat(
    ethers.utils.formatUnits(String(amountOut), tokenOut.decimals),
  );
  if (tokenIn.userBalance < amountInValue) {
    return true;
  } else if (amountInValue == 0) {
    return true;
  } else if (
    tokenIn.address == ZERO_ADDRESS ||
    tokenOut.address == ZERO_ADDRESS
  ) {
    return true;
  } else if (amountOutValue == 0) {
    return true;
  }
  return false;
}

export function getRangeMintButtonMessage(
  tokenInAmount: BigNumber,
  tokenOutAmount: BigNumber,
  liquidityAmount: JSBI,
  tokenIn: token,
  tokenOut: token,
  rangePoolAddress: string,
  startPrice: string,
): string {
  if (
    tokenIn.userBalance <
    parseFloat(formatUnits(String(tokenInAmount), tokenIn.decimals))
  ) {
    return "Low " + tokenIn.symbol + " Balance";
  } else if (
    tokenOut.userBalance <
    parseFloat(formatUnits(String(tokenOutAmount), tokenOut.decimals))
  ) {
    return "Low " + tokenOut.symbol + " Balance";
  } else if (tokenInAmount.eq(BN_ZERO) && tokenOutAmount.eq(BN_ZERO)) {
    return "Enter Amount";
  } else if (rangePoolAddress == ZERO_ADDRESS) {
    const priceStart = parseFloat(startPrice);
    if (isNaN(priceStart) || priceStart <= 0)
      // invalid start price
      return "Enter Start Price";
  } else if (JSBI.lessThanOrEqual(liquidityAmount, ONE)) {
    return "No Liquidity Added";
  } else {
    return "Mint Range Position";
  }
}

export function getRangeMintButtonDisabled(
  tokenInAmount: BigNumber,
  tokenOutAmount: BigNumber,
  liquidityAmount: JSBI,
  tokenIn: token,
  tokenOut: token,
  rangePoolAddress: string,
  startPrice: string,
): boolean {
  if (
    tokenIn.userBalance <
      parseFloat(formatUnits(String(tokenInAmount), tokenIn.decimals)) ||
    tokenOut.userBalance <
      parseFloat(formatUnits(String(tokenOutAmount), tokenOut.decimals))
  ) {
    return true;
  } else if (tokenInAmount.eq(BN_ZERO) && tokenOutAmount.eq(BN_ZERO)) {
    return true;
  } else if (rangePoolAddress == ZERO_ADDRESS) {
    const priceStart = parseFloat(startPrice);
    if (isNaN(priceStart) || priceStart <= 0)
      // invalid start price
      return true;
  } else if (JSBI.lessThanOrEqual(liquidityAmount, ONE)) {
    return true;
  } else {
    return false;
  }
}

export function getCoverMintButtonMessage(
  tokenInAmount: BigNumber,
  tokenIn: token,
  coverPoolAddress: string,
  inputPoolExists: boolean,
  twapReady: boolean,
): string {
  if (
    tokenIn.userBalance <
    parseFloat(formatUnits(String(tokenInAmount), tokenIn.decimals))
  ) {
    return "Low " + tokenIn.symbol + " Balance";
  } else if (tokenInAmount.eq(BN_ZERO) && inputPoolExists && twapReady) {
    return "Enter Amount";
  } else if (coverPoolAddress == ZERO_ADDRESS && !inputPoolExists) {
    return "No Pool for TWAP Data";
  } else if (
    coverPoolAddress != ZERO_ADDRESS &&
    inputPoolExists &&
    !twapReady
  ) {
    return "TWAP not ready";
  } else if (
    coverPoolAddress == ZERO_ADDRESS &&
    inputPoolExists &&
    !twapReady
  ) {
    return "Create Cover Pool";
  } else if (inputPoolExists && twapReady) {
    return "Mint Cover Position";
  }
}

export function getCoverMintButtonDisabled(
  tokenInAmount: BigNumber,
  tokenIn: token,
  coverPoolAddress: string,
  inputPoolExists: boolean,
  twapReady: boolean,
): boolean {
  if (
    tokenIn.userBalance <
    parseFloat(formatUnits(String(tokenInAmount), tokenIn.decimals))
  ) {
    return true;
  } else if (tokenInAmount.eq(BN_ZERO) && inputPoolExists && twapReady) {
    return true;
  } else if (coverPoolAddress == ZERO_ADDRESS && !inputPoolExists) {
    return true;
  } else if (
    coverPoolAddress != ZERO_ADDRESS &&
    inputPoolExists &&
    !twapReady
  ) {
    return true;
  } else if (
    coverPoolAddress == ZERO_ADDRESS &&
    inputPoolExists &&
    !twapReady
  ) {
    return false;
  } else if (coverPoolAddress != ZERO_ADDRESS && inputPoolExists && twapReady) {
    return false;
  }
}
