import { ZERO_ADDRESS } from "./math/constants";
import { TickMath } from "./math/tickMath";
import {
  getCoverPoolFromFactory,
  getLimitPoolFromFactory,
  getRangePoolFromFactory,
} from "./queries";
import { tokenCover, tokenRangeLimit, tokenSwap } from "./types";

//TODO@retraca enable this componnent to directly u0pdate zustand states

//Grab pool with most liquidity
export const getSwapPools = async (
  tokenIn: tokenSwap,
  tokenOut: tokenSwap,
  setSwapPoolData
) => {
  try {
    const limitPools = await getLimitPoolFromFactory(tokenIn.address, tokenOut.address);
    const data = limitPools["data"];
    if (data) {
      const allPools = data["limitPools"];
      setSwapPoolData(allPools[0]);
      return allPools;
    } else {
      return undefined;
    }
  } catch (error) {
    console.log(error);
  }
};

export const getRangePool = async (
  tokenIn: tokenRangeLimit,
  tokenOut: tokenRangeLimit,
  setRangePoolAddress,
  setRangePoolData
) => {
  try {
    const pool = await getRangePoolFromFactory(
      tokenIn.address,
      tokenOut.address
    );
    //TODO@retraca create here or new fucntion for choosing the right pool considering feetier
    let id = ZERO_ADDRESS;
    let rangePoolData = {};
    const dataLength = pool["data"]["limitPools"].length;
    if (dataLength != 0) {
      id = pool["data"]["limitPools"]["0"]["id"];
      rangePoolData = pool["data"]["limitPools"]["0"];
    } else {
      const fallbackPool = await getRangePoolFromFactory(
        tokenOut.address,
        tokenIn.address
      );
      id = fallbackPool["data"]["limitPools"]["0"]["id"];
      rangePoolData = fallbackPool["data"]["limitPools"]["0"];
    }
    setRangePoolAddress(id);
    setRangePoolData(rangePoolData);
  } catch (error) {
    console.log(error);
  }
};

export const getCoverPool = async (
  tokenIn: tokenCover,
  tokenOut: tokenCover,
  setCoverPoolAddress,
  setCoverPoolData
) => {
  try {
    const pool = await getCoverPoolFromFactory(
      tokenIn.address,
      tokenOut.address
    );
    let id = ZERO_ADDRESS;
    let coverPoolData = {};
    const dataLength = pool["data"]["coverPools"].length;

    if (coverPoolData) {
      for (let i = 0; i < dataLength; i++) {
        if (pool["data"]["coverPools"][i]["id"] == coverPoolData["id"]) {
          coverPoolData = pool["data"]["coverPools"][i];
        }
      }
    }
    if (dataLength != 0) {
      id = pool["data"]["coverPools"]["0"]["id"];
      coverPoolData = pool["data"]["coverPools"]["0"];
    } else {
      const fallbackPool = await getCoverPoolFromFactory(
        tokenOut.address,
        tokenIn.address
      );
      id = fallbackPool["data"]["coverPools"]["0"]["id"];
      coverPoolData = fallbackPool["data"]["coverPools"]["0"];
    }
    setCoverPoolAddress(id);
    setCoverPoolData(coverPoolData);
  } catch (error) {
    console.log(error);
  }
};

export const getCoverPoolFromFeeTier = async (
  tokenIn: tokenCover,
  tokenOut: tokenCover,
  feeTier: number,
  setCoverPoolAddress,
  setCoverPoolData
) => {
  try {
    const pool = await getCoverPoolFromFactory(
      tokenIn.address,
      tokenOut.address
    );
    let id = ZERO_ADDRESS;
    let coverPoolData = {};
    const dataLength = pool["data"]["coverPools"].length;

    if (coverPoolData) {
      for (let i = 0; i < dataLength; i++) {
        if (pool["data"]["coverPools"][i]["id"] == coverPoolData["id"]) {
          console.log("found cover pool data", coverPoolData);
          coverPoolData = pool["data"]["coverPools"][i];
        }
      }
    }

    if (dataLength != 0) {
      id = pool["data"]["coverPools"]["0"]["id"];
      coverPoolData = pool["data"]["coverPools"]["0"];
    } else {
      const fallbackPool = await getCoverPoolFromFactory(
        tokenOut.address,
        tokenIn.address
      );
      id = fallbackPool["data"]["coverPools"]["0"]["id"];
      coverPoolData = fallbackPool["data"]["coverPools"]["0"];
    }
    setCoverPoolAddress(id);
    setCoverPoolData(coverPoolData);
  } catch (error) {
    console.log(error);
  }
};

export const getCoverPoolInfo = async (
  poolRoute: string,
  tokenOrder: boolean,
  tokenIn: tokenCover,
  tokenOut: tokenCover,
  setCoverPoolRoute,
  setCoverPrice,
  setTokenInUsdPrice,
  volatility,
  setVolatility,
  setLatestTick?,
  lowerPrice?,
  upperPrice?,
  setLowerPrice?,
  setUpperPrice?,
  expectedTickSpread?,
  changeDefaultPrices?
) => {
  try {
    const pool = await getCoverPoolFromFactory(
      tokenIn.address,
      tokenOut.address
    );
    const dataLength = pool["data"]["coverPools"].length;
    if (dataLength) {
      for (let i = 0; i < dataLength; i++) {
        const newPoolRoute = pool["data"]["coverPools"][i]["id"];
        const tickSpread = parseInt(
          pool["data"]["coverPools"][i]["volatilityTier"]["tickSpread"]
        );
        if (
          (poolRoute && newPoolRoute == poolRoute) ||
          (expectedTickSpread && tickSpread == expectedTickSpread)
        ) {
          setCoverPoolRoute(pool["data"]["coverPools"][i]["id"]);
          if (tickSpread == 20) {
            if (volatility != 0) {
              console.log("change to tier 0");
              changeDefaultPrices = true;
              setVolatility(0);
            }
          } else if (tickSpread == 40) {
            console.log("vol tier 40", volatility, poolRoute == newPoolRoute);
            if (volatility != 1) {
              console.log("change to tier 1");
              changeDefaultPrices = true;
              setVolatility(1);
            }
          }
          const newLatestTick = parseInt(
            pool["data"]["coverPools"][i]["latestTick"]
          );
          if (setCoverPrice) {
            console.log(
              "getting cover price",
              TickMath.getPriceStringAtTick(newLatestTick, tokenIn, tokenOut),
              tickSpread
            );
            setCoverPrice(TickMath.getPriceStringAtTick(newLatestTick, tokenIn, tokenOut));
          }

          if (setTokenInUsdPrice) {
            setTokenInUsdPrice(
              parseFloat(
                tokenOrder
                  ? pool["data"]["coverPools"][i]["token0"]["usdPrice"]
                  : pool["data"]["coverPools"][i]["token1"]["usdPrice"]
              )
            );
          }
          if (setLatestTick) {
            setLatestTick(newLatestTick);
            console.log(
              "setting latest tick",
              tokenOrder,
              newLatestTick,
              tickSpread,
              newLatestTick + tickSpread * 6
            );
            console.log(
              "setting latest lower price",
              poolRoute != newPoolRoute,
              changeDefaultPrices
            );
            if (
              (poolRoute != newPoolRoute && setLowerPrice != undefined) ||
              changeDefaultPrices
            ) {
              setLowerPrice(
                TickMath.getPriceStringAtTick(
                  tokenOrder
                    ? newLatestTick + -tickSpread * 16
                    : newLatestTick + tickSpread * 8,
                  tokenIn, tokenOut,
                  tickSpread
                )
              );
            }
            if (
              (poolRoute != newPoolRoute && setUpperPrice) ||
              changeDefaultPrices
            ) {
              setUpperPrice(
                TickMath.getPriceStringAtTick(
                  tokenOrder
                    ? newLatestTick - tickSpread * 6
                    : newLatestTick + tickSpread * 18,
                  tokenIn, tokenOut,
                  tickSpread
                )
              );
            }
          }
        }
      }
    } else {
      setCoverPoolRoute(ZERO_ADDRESS);
      setCoverPrice("1.00");
      setTokenInUsdPrice("1.00");
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
  'constant-product': 0
}
