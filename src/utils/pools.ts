import { formatBytes32String } from "ethers/lib/utils.js";
import { getLimitPoolFromFactory } from "./queries";
import { LimitSubgraph, tokenSwap } from "./types";
import { ZERO_ADDRESS } from "./math/constants";
import { fetchTokenUSDPrice } from "./tokens";

export const getSwapPools = async (
  client: LimitSubgraph,
  tokenIn: tokenSwap,
  tokenOut: tokenSwap,
  swapPoolData,
  setSwapPoolData,
  setTokenInTradeUSDPrice,
  setTokenOutTradeUSDPrice,
  setSwapPoolPrice?,
  setSwapPoolLiquidity?,
  poolTypeId?: number,
  setSelectedFeeTier?: any,
) => {
  try {
    const limitPools = await getLimitPoolFromFactory(
      client,
      tokenIn.address,
      tokenOut.address,
      poolTypeId,
    );
    const data = limitPools["data"];
    if (data && data["limitPools"]?.length > 0) {
      const allPools = data["limitPools"];
      //the selected pool should be the pool with most tvl
      const selectedPool = allPools.reduce((prev, current) =>
        Number(prev.totalValueLockedUsd) > Number(current.totalValueLockedUsd)
          ? prev
          : current,
      );
      if (setSelectedFeeTier)
        setSelectedFeeTier(selectedPool.feeTier.feeAmount);
      if (swapPoolData?.id != selectedPool.id) {
        setSwapPoolData(selectedPool);
      } else {
        if (setSwapPoolPrice != undefined) {
          if (selectedPool.poolPrice != swapPoolData.poolPrice) {
            setSwapPoolPrice(selectedPool.poolPrice);
          }
        }
        if (setSwapPoolLiquidity != undefined) {
          if (selectedPool.liquidity != swapPoolData.liquidity) {
            setSwapPoolLiquidity(selectedPool.liquidity);
          }
        }
      }
      fetchTokenUSDPrice(selectedPool, tokenIn, setTokenInTradeUSDPrice);
      fetchTokenUSDPrice(selectedPool, tokenOut, setTokenOutTradeUSDPrice);
      return allPools;
    } else {
      return setSwapPoolData({
        id: ZERO_ADDRESS,
        feeTier: {
          feeAmount: 3000,
          tickSpacing: 30,
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const getLimitPoolForFeeTier = async (
  client: LimitSubgraph,
  tokenIn: tokenSwap,
  tokenOut: tokenSwap,
  feeTier: number,
  poolTypeId?: number,
) => {
  try {
    const limitPools = await getLimitPoolFromFactory(
      client,
      tokenIn.address,
      tokenOut.address,
      poolTypeId,
    );
    const data = limitPools["data"];
    if (data && data["limitPools"]?.length > 0) {
      const allPools = data["limitPools"];
      const selectedPool = allPools.find(
        (pool) => pool.feeTier.feeAmount == feeTier,
      );
      if (selectedPool != undefined) {
        return selectedPool;
      } else {
        return {
          id: ZERO_ADDRESS,
        };
      }
    } else {
      return {
        id: ZERO_ADDRESS,
      };
    }
  } catch (error) {
    console.log(error);
  }
};

export const feeTiers = [
  {
    id: 0,
    tier: "0.1%",
    tierId: 1000,
    text: "Best for stable pairs",
    unavailable: false,
  },
  {
    id: 1,
    tier: "0.3%",
    tierId: 3000,
    text: "Best for most pairs",
    unavailable: false,
  },
  {
    id: 2,
    tier: "1%",
    tierId: 10000,
    text: "Best for exotic pairs",
    unavailable: false,
  },
];

export const feeTierMap = {
  1000: {
    id: 0,
    tier: "0.1%",
    tierId: 1000,
    tickSpacing: 10,
    text: "Best for stable pairs",
    unavailable: false,
  },
  3000: {
    id: 1,
    tier: "0.3%",
    tierId: 3000,
    tickSpacing: 30,
    text: "Best for most pairs",
    unavailable: false,
  },
  10000: {
    id: 2,
    tier: "1%",
    tierId: 10000,
    tickSpacing: 100,
    text: "Best for exotic pairs",
    unavailable: false,
  },
};

export const volatilityTiers = [
  {
    id: 0,
    tier: "1% per min",
    text: "Less Volatility",
    unavailable: false,
    feeAmount: 1000,
    tickSpread: 20,
    twapLength: 12,
    auctionLength: 12,
  },
  {
    id: 1,
    tier: "3% per min",
    text: "More Volatility",
    unavailable: false,
    feeAmount: 3000,
    tickSpread: 60,
    twapLength: 12,
    auctionLength: 12,
  },
  {
    id: 2,
    tier: "24% per min",
    text: "Most Volatility",
    unavailable: false,
    feeAmount: 10000,
    tickSpread: 60,
    twapLength: 12,
    auctionLength: 5,
  },
];

export const limitPoolTypeIds = {
  "constant-product-1.1": 2,
};

export const coverPoolTypes = {
  "constant-product-1.1": {
    poolshark: formatBytes32String("PSHARK-CPROD"),
  },
};
