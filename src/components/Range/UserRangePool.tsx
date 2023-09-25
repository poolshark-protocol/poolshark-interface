import { useEffect, useState } from "react";
import { TickMath } from "../../utils/math/tickMath";
import { fetchRangeTokenUSDPrice, logoMap } from "../../utils/tokens";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { BigNumber, ethers } from "ethers";
import Link from "next/link";
import { getRangePool, volatilityTiers } from "../../utils/pools";
import { useCoverStore } from "../../hooks/useCoverStore";
import { tokenCover } from "../../utils/types";
import { DyDxMath } from "../../utils/math/dydxMath";
import JSBI from "jsbi";
import { getRangePoolFromFactory } from "../../utils/queries";

export default function UserRangePool({ rangePosition, href, isModal }) {
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

  const [amount0, setAmount0] = useState(0);
  const [amount1, setAmount1] = useState(0);
  const [totalUsdValue, setTotalUsdValue] = useState(0);

  //////////////////////////Set USD Prices

  useEffect(() => {
    getPoolForThisTile();
  }, [rangePosition]);

  async function getPoolForThisTile() {
    const tokenInNew = {
      name: rangePosition.tokenZero.name,
      symbol: rangePosition.tokenZero.symbol,
      logoURI: logoMap[rangePosition.tokenZero.symbol],
      address: rangePosition.tokenZero.id,
      decimals: rangePosition.tokenZero.decimals,
    } as tokenCover;
    const tokenOutNew = {
      name: rangePosition.tokenOne.name,
      symbol: rangePosition.tokenOne.symbol,
      logoURI: logoMap[rangePosition.tokenOne.symbol],
      address: rangePosition.tokenOne.id,
      decimals: rangePosition.tokenOne.decimals,
    } as tokenCover;
    const pool = await getRangePoolFromFactory(
      tokenInNew.address,
      tokenOutNew.address
    );
    const dataLength = pool["data"]["limitPools"].length;
    for (let i = 0; i < dataLength; i++) {
      if (
        pool["data"]["limitPools"][i]["feeTier"]["feeAmount"] ==
        rangePosition.pool.feeTier.feeAmount
      ) {
        console.log("selectedPool", pool["data"]["limitPools"][i]);
        const poolData = pool["data"]["limitPools"][i];
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

  ////////////////////////Set Amounts

  useEffect(() => {
    setAmounts();
  }, [rangePosition, rangeTokenIn.rangeUSDPrice, rangeTokenOut.rangeUSDPrice]);

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
        ) * rangeTokenIn.rangeUSDPrice;
      const token1UsdValue =
        parseFloat(
          ethers.utils.formatUnits(amount1Bn, rangePosition.tokenOne.decimals)
        ) * rangeTokenOut.rangeUSDPrice;
      setTotalUsdValue(token0UsdValue + token1UsdValue);
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
      logoURI: logoMap[rangePosition.tokenZero.symbol],
      address: rangePosition.tokenZero.id,
      decimals: rangePosition.tokenZero.decimals,
    } as tokenCover;
    const tokenOutNew = {
      name: rangePosition.tokenOne.name,
      symbol: rangePosition.tokenOne.symbol,
      logoURI: logoMap[rangePosition.tokenOne.symbol],
      address: rangePosition.tokenOne.id,
      decimals: rangePosition.tokenOne.decimals,
    } as tokenCover;
    if (href.includes("cover")) {
      setCoverTokenIn(tokenOutNew, tokenInNew);
      setCoverTokenOut(tokenInNew, tokenOutNew);
      setRangePositionData(rangePosition);
      setCoverPoolFromVolatility(tokenInNew, tokenOutNew, volatilityTiers[0]);
    } else {
      setRangeTokenIn(tokenOutNew, tokenInNew);
      setRangeTokenOut(tokenInNew, tokenOutNew);
      setRangePoolFromFeeTier(
        tokenInNew,
        tokenOutNew,
        rangePosition.pool.feeTier.feeAmount
      );
      setRangePositionData(rangePosition);
    }
  }

  return (
    <>
      <div onClick={choosePosition}>
        <Link
          href={{
            pathname: href,
          }}
        >
          <div className="grid grid-cols-4 items-center bg-black px-4 py-3 rounded-[4px] border-grey border hover:bg-main1/20 cursor-pointer">
            <div className="flex items-center gap-x-6">
              <div className="flex items-center">
                <img
                  className="w-[25px] h-[25px]"
                  src={logoMap[rangePosition.tokenZero.symbol]}
                />
                <img
                  className="w-[25px] h-[25px] ml-[-8px]"
                  src={logoMap[rangePosition.tokenOne.symbol]}
                />
              </div>
              <span className="text-white text-xs flex items-center gap-x-1.5">
                {rangePosition.tokenZero.symbol} -{" "}
                {rangePosition.tokenOne.symbol}
              </span>
              <span className="bg-grey/50 rounded-[4px] text-grey1 text-xs px-3 py-0.5">
                {Number(Number(rangePosition.feeTier) / 10000).toFixed(2)}%
              </span>
            </div>
            <div
              className={`text-white text-xs ${
                isModal ? "text-right col-span-2" : "text-right"
              }`}
            >
              {TickMath.getPriceStringAtTick(Number(rangePosition.min))} -{" "}
              {TickMath.getPriceStringAtTick(Number(rangePosition.max))}{" "}
              <span className="text-grey1">
                {rangePosition.zeroForOne
                  ? rangePosition.tokenOne.symbol
                  : rangePosition.tokenZero.symbol}{" "}
                PER{" "}
                {rangePosition.zeroForOne
                  ? rangePosition.tokenZero.symbol
                  : rangePosition.tokenOne.symbol}
              </span>
            </div>
            <div className={`text-white text-xs text-right`}>
              {amount0.toPrecision(4)}{" "}
              <span className="text-grey1">
                {rangePosition.tokenZero.symbol}
              </span>{" "}
              - {amount1.toPrecision(4)}{" "}
              <span className="text-grey1">
                {rangePosition.tokenOne.symbol}
              </span>
            </div>
            <div className="text-right text-white text-xs">
              {!isModal && <span>${totalUsdValue}</span>}
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}
