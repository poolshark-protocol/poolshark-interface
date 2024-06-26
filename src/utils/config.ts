import {
  chainProperties,
  supportedChainIds,
  supportedNetworkNames,
} from "./chains";
import { ZERO_ADDRESS } from "./math/constants";
import { invertPrice, TickMath } from "./math/tickMath";
import { numStringFormat } from "./math/valueMath";

export const getRouterAddress = (networkName: string) => {
  if (chainProperties[networkName]) {
    if (chainProperties[networkName]["routerAddress"]) {
      return chainProperties[networkName]["routerAddress"];
    }
  }
  return chainProperties["arbitrum-one"]["routerAddress"];
};

export const getRangeStakerAddress = (networkName: string) => {
  if (chainProperties[networkName]) {
    if (chainProperties[networkName]["rangeStakerAddress"]) {
      return chainProperties[networkName]["rangeStakerAddress"];
    }
  }
  return chainProperties["arbitrum-one"]["rangeStakerAddress"];
};

export const getTokenBalance = (
  chainId: number,
  coin: any,
  tokenBalanceInfo: any,
) => {
  const networkName = supportedNetworkNames[supportedChainIds[chainId]];
  // if chain supports AlchemySDK use coin.balance
  if (chainProperties[networkName]) {
    if (chainProperties[networkName]?.sdkSupport?.alchemy) {
      return coin.balance ?? "0";
    }
  }
  // else use wagmi hook
  if (!isNaN(Number(tokenBalanceInfo?.formatted))) {
    return numStringFormat(tokenBalanceInfo?.formatted, 5);
  }
  return "0";
};

export const isAlchemySDKSupported = (chainId: number) => {
  // check chain id support
  const supportedChainId = supportedChainIds[chainId];
  if (supportedChainId) {
    // check network name support
    const supportedNetworkName = supportedNetworkNames[supportedChainId];
    if (supportedNetworkName) {
      // check chain config exists
      const chainConfig = chainProperties[supportedNetworkName];
      if (chainConfig) {
        // check alchemy sdk support
        if (chainConfig?.sdkSupport?.alchemy) {
          return true;
        }
      }
    }
  }
  // default not supported
  return false;
};

export const tokenAddressRegex = /^0x[a-fA-F0-9]{40}$/;

const isAddress = (input: string) => {
  // validate address
  if (input.match(tokenAddressRegex)?.length == 1 && input.length == 42) {
    // if not in listed tokens or search tokens we need to fetch data from the chain
    return true;
  }
  return false;
};

export const addressMatches = (addressA: string, addressB: string) => {
  // validate address
  if (addressA.toLocaleLowerCase() == addressB.toLocaleLowerCase()) {
    // if not in listed tokens or search tokens we need to fetch data from the chain
    return true;
  }
  return false;
};

export const isWeth = (address: string, networkName: string) => {
  // validate address
  if (addressMatches(address, chainProperties[networkName]["wethAddress"])) {
    return true;
  }
  return false;
};

export const isWhitelistedPool = (
  rangePool: any,
  networkName: string,
): boolean => {
  if (!rangePool?.poolId) {
    return false;
  } else if (chainProperties[networkName]?.whitelistedPools) {
    const whitelistedPools: string[] =
      chainProperties[networkName].whitelistedPools;
    if (whitelistedPools.indexOf(rangePool?.poolId) != -1) {
      return true;
    }
    return false;
  }
  return false;
};

export const getWhitelistedIndex = (
  rangePool: any,
  networkName: string,
): number => {
  if (!rangePool?.poolId) {
    console.log("percent early return");
    return -1;
  } else if (chainProperties[networkName]?.whitelistedPools) {
    const whitelistedPools: string[] =
      chainProperties[networkName].whitelistedPools;
    if (whitelistedPools.indexOf(rangePool?.poolId) != -1) {
      return whitelistedPools.indexOf(rangePool?.poolId);
    }
    console.log(
      "percent early return",
      whitelistedPools,
      networkName,
      rangePool.poolId,
    );
    return -1;
  }
  return -1;
};

export const isWhitelistedPair = (
  tokenIn: any,
  tokenOut: any,
  feeTier: string,
  networkName: string,
): boolean => {
  if (!tokenIn?.address || !tokenOut?.address) {
    return false;
  } else if (chainProperties[networkName]?.whitelistedPairs) {
    const whitelistedPairs: string[] =
      chainProperties[networkName].whitelistedPairs;
    const token0Address =
      tokenIn.callId == 0 ? tokenIn.address : tokenOut.address;
    const token1Address =
      tokenIn.callId == 0 ? tokenOut.address : tokenIn.address;
    const pairString = token0Address + "-" + token1Address + "-" + feeTier;
    if (whitelistedPairs.indexOf(pairString) != -1) {
      return true;
    }
    return false;
  }
  return false;
};

export const isStablePair = (
  tokenIn: any,
  tokenOut: any,
  networkName: string,
): boolean => {
  if (!tokenIn?.address || !tokenOut?.address) {
    return false;
  } else if (chainProperties[networkName]?.usdStables) {
    const usdStables: string[] = chainProperties[networkName]?.usdStables;
    if (
      usdStables.indexOf(tokenIn?.address?.toLowerCase()) != -1 &&
      usdStables.indexOf(tokenOut?.address?.toLowerCase()) != -1
    ) {
      return true;
    }
    return false;
  }
  return false;
};

export const isStablePool = (
  poolAddress: string,
  networkName: string,
): boolean => {
  if (!poolAddress || poolAddress == ZERO_ADDRESS) {
    return false;
  } else if (chainProperties[networkName]?.stablePools) {
    const stablePools: string[] = chainProperties[networkName]?.stablePools;
    if (stablePools.indexOf(poolAddress) != -1) {
      return true;
    }
    return false;
  }
  return false;
};

export const setDefaultRange = (
  tokenIn: any,
  tokenOut: any,
  networkName: string,
  priceOrder: boolean,
  tickAtPrice: any,
  setMinInput: any,
  setMaxInput: any,
  poolAddress?: string,
) => {
  //console.log('setting new default range', poolAddress, isStablePool(poolAddress, networkName))
  if (
    isStablePair(tokenIn, tokenOut, networkName) ||
    (poolAddress != undefined && isStablePool(poolAddress, networkName))
  ) {
    //console.log('stable pair')
    setMinInput(
      invertPrice(
        priceOrder == (tokenIn.callId == 0) ? "0.98" : "1.02",
        priceOrder == (tokenIn.callId == 0),
      ),
    );
    setMaxInput(
      invertPrice(
        priceOrder == (tokenIn.callId == 0) ? "1.02" : "0.98",
        priceOrder == (tokenIn.callId == 0),
      ),
    );
  } else {
    //console.log('non stable pair')
    setMinInput(
      invertPrice(
        TickMath.getPriceStringAtTick(
          priceOrder == (tokenIn.callId == 0)
            ? tickAtPrice - 7000
            : tickAtPrice - -7000,
          tokenIn,
          tokenOut,
        ),
        priceOrder == (tokenIn.callId == 0),
      ),
    );
    setMaxInput(
      invertPrice(
        TickMath.getPriceStringAtTick(
          priceOrder == (tokenIn.callId == 0)
            ? tickAtPrice - -7000
            : tickAtPrice - 7000,
          tokenIn,
          tokenOut,
        ),
        priceOrder == (tokenIn.callId == 0),
      ),
    );
  }
};
