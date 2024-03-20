import { BigNumber, ethers } from "ethers"

export function useCopyElementUseEffect(event, setCopied) {
  if (event) {
    const timer = setTimeout(() => {
      setCopied(false)
    }, 1500)
    return () => clearTimeout(timer)
  }
}


function convertBigIntAndBigNumber(input: bigint): BigNumber;
function convertBigIntAndBigNumber(input: BigNumber): bigint;
function convertBigIntAndBigNumber(input) {
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

export function deepConvertBigIntAndBigNumber<T>(value: T): ConvertBigIntAndBigNumber<T> {
  // Direct conversion for BigNumbers
  if (BigNumber.isBigNumber(value)) {
    return convertBigIntAndBigNumber(value) as ConvertBigIntAndBigNumber<T>;
  }

  // Direct conversion for bigints
  if (typeof value === 'bigint') {
    return convertBigIntAndBigNumber(value) as ConvertBigIntAndBigNumber<T>;
  }

  // Recursively handle arrays
  if (Array.isArray(value)) {
    return value.map(
      item => deepConvertBigIntAndBigNumber(item)
    ) as unknown as ConvertBigIntAndBigNumber<T>;
  }
  
  // Recursively handle objects
  if (value !== null && typeof value === 'object') {
    const convertedObject: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      convertedObject[key] = deepConvertBigIntAndBigNumber(val);
    }
    return convertedObject as ConvertBigIntAndBigNumber<T>;
  }

  // Return the value unchanged if it's not an object, array, BigNumber, or bigint
  return value as ConvertBigIntAndBigNumber<T>;
}
