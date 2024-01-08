import { useEffect, useState } from "react";
import { TickMath } from "../../utils/math/tickMath";
import { fetchRangeTokenUSDPrice } from "../../utils/tokens";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { BigNumber, ethers } from "ethers";
import { useCoverStore } from "../../hooks/useCoverStore";
import { token, tokenCover, tokenRangeLimit } from "../../utils/types";
import { DyDxMath } from "../../utils/math/dydxMath";
import JSBI from "jsbi";
import { getRangePoolFromFactory } from "../../utils/queries";
import router from "next/router";
import { useConfigStore } from "../../hooks/useConfigStore";
import { formatUsdValue } from "../../utils/math/valueMath";

export default function UserRangePool({ rangePosition, href, isModal }) {
  const [limitSubgraph, coverSubgraph, logoMap] = useConfigStore((state) => [
    state.limitSubgraph,
    state.coverSubgraph,
    state.logoMap,
  ]);

  const [
    rangePoolData,
    rangeTokenIn,
    rangeTokenOut,
    setRangeTokenIn,
    setRangeTokenInUSDPrice,
    setRangeTokenOut,
    setTokenOutRangeUSDPrice,
    setRangePoolAddress,
    setRangePoolData,
    setRangePositionData,
    setRangePoolFromFeeTier,
    setNeedsAllowanceIn,
    setNeedsAllowanceOut,
  ] = useRangeLimitStore((state) => [
    state.rangePoolData,
    state.tokenIn,
    state.tokenOut,
    state.setTokenIn,
    state.setTokenInRangeUSDPrice,
    state.setTokenOut,
    state.setTokenOutRangeUSDPrice,
    state.setRangePoolAddress,
    state.setRangePoolData,
    state.setRangePositionData,
    state.setRangePoolFromFeeTier,
    state.setNeedsAllowanceIn,
    state.setNeedsAllowanceOut,
  ]);

  const [
    setCoverTokenIn,
    setCoverTokenOut,
    setCoverPoolAddress,
    setCoverPoolData,
    setCoverPositionData,
    setCoverPoolFromVolatility,
  ] = useCoverStore((state) => [
    state.setTokenIn,
    state.setTokenOut,
    state.setCoverPoolAddress,
    state.setCoverPoolData,
    state.setCoverPositionData,
    state.setCoverPoolFromVolatility,
  ]);

  //////////////////////////Set USD Prices
  //Todo token in and out prices should local to the tile and not set at the store level
  /* const [amount0, setAmount0] = useState(0);
  const [amount1, setAmount1] = useState(0); */

  function setTokenAddressFromId(token: any): token {
    token = {
      ...token,
      address: token.id,
    };
    return token;
  }

  useEffect(() => {
    getPoolForThisTile();
  }, [rangePosition]);

  async function getPoolForThisTile() {
    const tokenInNew = {
      name: rangePosition.tokenZero.name,
      symbol: rangePosition.tokenZero.symbol,
      logoURI: logoMap[rangePosition.tokenZero.id],
      address: rangePosition.tokenZero.id,
      decimals: rangePosition.tokenZero.decimals,
    } as tokenRangeLimit;
    const tokenOutNew = {
      name: rangePosition.tokenOne.name,
      symbol: rangePosition.tokenOne.symbol,
      logoURI: logoMap[rangePosition.tokenOne.id],
      address: rangePosition.tokenOne.id,
      decimals: rangePosition.tokenOne.decimals,
    } as tokenRangeLimit;
    const pool = await getRangePoolFromFactory(
      limitSubgraph,
      tokenInNew.address,
      tokenOutNew.address
    );
    if (pool && pool["data"] && pool["data"]["limitPools"]) {
      const dataLength = pool["data"]["limitPools"].length;
      for (let i = 0; i < dataLength; i++) {
        if (
          pool["data"]["limitPools"][i]["feeTier"]["feeAmount"] ==
          rangePosition.pool.feeTier.feeAmount
        ) {
          const poolData = pool["data"]["limitPools"][i];
          setRangePoolData(poolData);
          if (poolData.token0 && poolData.token1) {
            if (rangeTokenIn.address) {
              fetchRangeTokenUSDPrice(
                poolData,
                rangeTokenIn,
                setRangeTokenInUSDPrice
              );
            }
            if (rangeTokenOut.address) {
              fetchRangeTokenUSDPrice(
                poolData,
                rangeTokenOut,
                setTokenOutRangeUSDPrice
              );
            }
          }
        }
      }
    }
  }

  ////////////////////////Set Amounts
  const [amount0, setAmount0] = useState(0);
  const [amount1, setAmount1] = useState(0);
  const [totalUsdValue, setTotalUsdValue] = useState(0);

  useEffect(() => {
    setAmounts();
  }, [rangePosition, rangeTokenIn.USDPrice, rangeTokenOut.USDPrice]);

  function setAmounts() {
    try {
      const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(
        Number(rangePosition.min)
      );
      const upperSqrtPrice = TickMath.getSqrtRatioAtTick(
        Number(rangePosition.max)
      );
      const rangeSqrtPrice = JSBI.BigInt(rangePosition.price);
      const liquidity = JSBI.BigInt(rangePosition.userLiquidity);
      const amounts = DyDxMath.getAmountsForLiquidity(
        lowerSqrtPrice,
        upperSqrtPrice,
        rangeSqrtPrice,
        liquidity,
        true
      );
      // set amount based on bnInput
      const amount0Bn = BigNumber.from(String(amounts.token0Amount));
      const amount1Bn = BigNumber.from(String(amounts.token1Amount));
      setAmount0(
        parseFloat(
          ethers.utils.formatUnits(amount0Bn, rangePosition.tokenZero.decimals)
        )
      );
      setAmount1(
        parseFloat(
          ethers.utils.formatUnits(amount1Bn, rangePosition.tokenOne.decimals)
        )
      );
      const token0UsdValue =
        parseFloat(
          ethers.utils.formatUnits(amount0Bn, rangePosition.tokenZero.decimals)
        ) * rangePosition.tokenZero.usdPrice;
      const token1UsdValue =
        parseFloat(
          ethers.utils.formatUnits(amount1Bn, rangePosition.tokenOne.decimals)
        ) * rangePosition.tokenOne.usdPrice;
      setTotalUsdValue(
        parseFloat((token0UsdValue + token1UsdValue).toFixed(2))
      );
    } catch (error) {
      console.log(error);
    }
  }

  ////////////////////////Set Position when selected

  function choosePosition() {
    setNeedsAllowanceIn(true);
    setNeedsAllowanceOut(true);
    const tokenInNew = {
      name: rangePosition.tokenZero.name,
      symbol: rangePosition.tokenZero.symbol,
      logoURI: logoMap[rangePosition.tokenZero.id],
      address: rangePosition.tokenZero.id,
      decimals: rangePosition.tokenZero.decimals,
    } as tokenCover;
    const tokenOutNew = {
      name: rangePosition.tokenOne.name,
      symbol: rangePosition.tokenOne.symbol,
      logoURI: logoMap[rangePosition.tokenOne.id],
      address: rangePosition.tokenOne.id,
      decimals: rangePosition.tokenOne.decimals,
    } as tokenCover;
    if (href.includes("cover")) {
      setCoverTokenIn(tokenOutNew, tokenInNew, "0", true);
      setCoverTokenOut(tokenInNew, tokenOutNew, "0", false);
      setRangePositionData(rangePosition);
      setCoverPoolFromVolatility(
        tokenInNew,
        tokenOutNew,
        "1000",
        coverSubgraph
      );
    } else {
      setRangeTokenIn(tokenOutNew, tokenInNew, "0", true);
      setRangeTokenOut(tokenInNew, tokenOutNew, "0", false);
      setRangePositionData(rangePosition);
      //async setter should be last
      setRangePoolFromFeeTier(
        tokenInNew,
        tokenOutNew,
        rangePosition.pool.feeTier.feeAmount,
        limitSubgraph
      );
    }
    router.push({
      pathname: href,
      query: {
        id: rangePosition.id,
        feeTier: rangePosition.pool.feeTier.feeAmount,
        state: router.pathname.includes("/cover") && "range-cover",
      },
    });
  }

  return (
    <>
      <div onClick={choosePosition}>
        <div
          className={`${
            isModal ? "grid-cols-3 " : "lg:grid-cols-2"
          } lg:grid lg:items-center left bg-black px-4 py-3 rounded-[4px] border-grey border hover:bg-main1/20 cursor-pointer`}
        >
          <div
            className={`grid sm:grid-cols-2 grid-rows-2 sm:grid-rows-1 items-center gap-y-2 w-full ${
              isModal ? "col-span-2" : "col-span-1"
            }`}
          >
            <div className="flex items-center gap-x-6 w-full ">
              <div className="flex items-center">
                <img
                  className="w-[25px] h-[25px] aspect-square shrink-0"
                  src={logoMap[rangePosition.tokenZero.id]}
                />
                <img
                  className="w-[25px] h-[25px] ml-[-8px] aspect-square shrink-0"
                  src={logoMap[rangePosition.tokenOne.id]}
                />
              </div>
              <span className="text-white text-xs flex items-center gap-x-1.5 whitespace-nowrap">
                {rangePosition.tokenZero.symbol} -{" "}
                {rangePosition.tokenOne.symbol}
              </span>
              <span className="bg-grey/50 rounded-[4px] text-grey1 text-xs px-3 py-0.5">
                {Number(Number(rangePosition.feeTier) / 10000).toFixed(2)}%
              </span>
            </div>
            <div
              className={`text-white text-xs lg:text-right text-left whitespace-nowrap`}
            >
              {TickMath.getPriceStringAtTick(
                Number(rangePosition.min),
                setTokenAddressFromId(rangePosition.tokenZero),
                setTokenAddressFromId(rangePosition.tokenOne)
              )}{" "}
              -{" "}
              {TickMath.getPriceStringAtTick(
                Number(rangePosition.max),
                setTokenAddressFromId(rangePosition.tokenZero),
                setTokenAddressFromId(rangePosition.tokenOne)
              )}{" "}
              <span className="text-grey1">
                {rangePosition.tokenOne.symbol} PER{" "}
                {rangePosition.tokenZero.symbol}
              </span>
            </div>
          </div>
          <div
            className={`lg:grid items-center lg:block hidden ${
              isModal ? "grid-cols-1 " : "lg:grid-cols-2"
            }`}
          >
            <div className={`text-white text-xs text-right`}>
              {amount0.toFixed(4)}{" "}
              <span className="text-grey1">
                {rangePosition.tokenZero.symbol}
              </span>{" "}
              - {amount1.toFixed(4)}{" "}
              <span className="text-grey1">
                {rangePosition.tokenOne.symbol}
              </span>
            </div>
            <div className="text-right text-white text-xs lg:block hidden">
              {!isModal && (
                <span>${formatUsdValue(totalUsdValue.toString())}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
