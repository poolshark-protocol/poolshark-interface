import { ZERO_ADDRESS } from "./math/constants";
import { TickMath } from "./math/tickMath";
import {
  fetchCoverPools,
  fetchRangePools,
  getCoverPoolFromFactory,
  getRangePoolFromFactory,
} from "./queries";
import { token } from "./types";

//TODO@retraca enable this componnent to directly u0pdate zustand states

export const getRangePool = async (
  tokenIn: token,
  tokenOut: token,
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
    const dataLength = pool["data"]["rangePools"].length;
    if (dataLength != 0) {
      id = pool["data"]["rangePools"]["0"]["id"];
      rangePoolData = pool["data"]["rangePools"]["0"];
    } else {
      const fallbackPool = await getRangePoolFromFactory(
        tokenOut.address,
        tokenIn.address
      );
      id = fallbackPool["data"]["rangePools"]["0"]["id"];
      rangePoolData = fallbackPool["data"]["rangePools"]["0"];
    }
    setRangePoolAddress(id);
    setRangePoolData(rangePoolData);
    console.log("range pool data", rangePoolData);
  } catch (error) {
    console.log(error);
  }
};

export const getCoverPool = async (
  tokenIn: token,
  tokenOut: token,
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
  tokenIn: token,
  tokenOut: token,
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
    console.log("getting pool info", poolRoute);
    const dataLength = pool["data"]["coverPools"].length;
    console.log("getting data length", dataLength);
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
          console.log("vol tier get spread", tickSpread, expectedTickSpread);
          setCoverPoolRoute(pool["data"]["coverPools"][i]["id"]);
          console.log("vol tier pool found", newPoolRoute);
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
              TickMath.getPriceStringAtTick(newLatestTick),
              tickSpread
            );
            setCoverPrice(TickMath.getPriceStringAtTick(newLatestTick));
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

export const getFeeTier = async (
  rangePoolRoute: string,
  coverPoolRoute: string,
  setRangeSlippage,
  setCoverSlippage
) => {
  const coverData = await fetchCoverPools();
  const coverPoolAddress = coverData["data"]["coverPools"]["0"]["id"];

  if (coverPoolAddress === coverPoolRoute) {
    const feeTier =
      coverData["data"]["coverPools"]["0"]["volatilityTier"]["feeAmount"];
    setCoverSlippage((parseFloat(feeTier) / 10000).toString());
  }
  const data = await fetchRangePools();
  const rangePoolAddress = data["data"]["rangePools"]["0"]["id"];

  if (rangePoolAddress === rangePoolRoute) {
    const feeTier = data["data"]["rangePools"]["0"]["feeTier"]["feeAmount"];
    setRangeSlippage((parseFloat(feeTier) / 10000).toString());
  }
};

export const feeTiers = [
  {
    id: 1,
    tier: "0.01%",
    tierId: 100,
    text: "Best for very stable pairs",
    unavailable: false,
  },
  {
    id: 2,
    tier: "0.05%",
    tierId: 500,
    text: "Best for stable pairs",
    unavailable: false,
  },
  {
    id: 3,
    tier: "0.3%",
    tierId: 3000,
    text: "Best for most pairs",
    unavailable: false,
  },
  {
    id: 4,
    tier: "1%",
    tierId: 10000,
    text: "Best for exotic pairs",
    unavailable: false,
  },
];
