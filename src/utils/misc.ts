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

type ConvertBigIntAndBigNumber<T> = T extends BigNumber
  ? bigint // Convert BigNumber to bigint
  : T extends bigint
  ? BigNumber // Convert bigint to BigNumber
  : T extends object
  ? { [K in keyof T]: ConvertBigIntAndBigNumber<T[K]> } // Recurse into objects
  : T; // Leave other types unchanged


export function deepConvertBigIntAndBigNumber<T>(obj: T): ConvertBigIntAndBigNumber<T> {
  if (BigNumber.isBigNumber(obj) || typeof obj === 'bigint') {
    // Direct conversion for BigNumber or bigint values
    return convertBigIntAndBigNumber(obj);
  } else if (Array.isArray(obj)) {
    // Recursively handle arrays
    return obj.map(deepConvertBigIntAndBigNumber);
  } else if (obj !== null && typeof obj === 'object') {
    // Recursively handle objects
    const convertedObject: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      convertedObject[key] = deepConvertBigIntAndBigNumber(value);
    }
    return convertedObject;
  }
  // Return the value unchanged if it's not an object, array, BigNumber, or bigint
  return obj;
}
