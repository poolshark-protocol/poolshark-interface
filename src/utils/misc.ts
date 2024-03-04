import { BigNumber, ethers } from "ethers"

export function useCopyElementUseEffect(event, setCopied) {
  if (event) {
    const timer = setTimeout(() => {
      setCopied(false)
    }, 1500)
    return () => clearTimeout(timer)
  }
}


export function convertBigIntAndBigNumber(input: bigint): BigNumber;
export function convertBigIntAndBigNumber(input: BigNumber): bigint;
export function convertBigIntAndBigNumber(input: undefined): undefined;
export function convertBigIntAndBigNumber(input) {
  if (input === undefined || input === null) return;

  if (BigNumber.isBigNumber(input)) {
    return BigInt(input.toString());
  }

  if (typeof input === 'bigint') {
    return BigNumber.from(input.toString());
  }
}