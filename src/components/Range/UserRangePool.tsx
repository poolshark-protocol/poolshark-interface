import { useEffect, useState } from "react";
import { TickMath } from "../../utils/math/tickMath";
import { logoMap } from "../../utils/tokens";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { ethers } from "ethers";
import Link from "next/link";
import { getRangePool, volatilityTiers } from "../../utils/pools";
import { useCoverStore } from "../../hooks/useCoverStore";
import { tokenCover } from "../../utils/types";

export default function UserRangePool({ rangePosition, href, isModal }) {
  const [
    rangeTokenIn,
    rangeTokenOut,
    setRangeTokenIn,
    setRangeTokenOut,
    setRangePoolAddress,
    setRangePoolData,
    setRangePositionData,
    setNeedsAllowanceIn,
    setNeedsAllowanceOut,
  ] = useRangeLimitStore((state) => [
    state.tokenIn,
    state.tokenOut,
    state.setTokenIn,
    state.setTokenOut,
    state.setRangePoolAddress,
    state.setRangePoolData,
    state.setRangePositionData,
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
      getRangePool(
        rangeTokenIn,
        rangeTokenOut,
        setRangePoolAddress,
        setRangePoolData
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
          <div className="lg:grid lg:grid-cols-2 lg:items-center left bg-black px-4 py-3 rounded-[4px] border-grey border hover:bg-main1/20 cursor-pointer">
            <div className="grid sm:grid-cols-2 grid-rows-2 sm:grid-rows-1 items-center gap-y-2 w-full">
            <div className="flex items-center gap-x-6 w-full ">
              <div className="flex items-center">
                <img
                  className="w-[25px] h-[25px] aspect-square shrink-0"
                  src={logoMap[rangePosition.tokenZero.symbol]}
                />
                <img
                  className="w-[25px] h-[25px] ml-[-8px] aspect-square shrink-0"
                  src={logoMap[rangePosition.tokenOne.symbol]}
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
              className={`text-white text-xs ${
                isModal ? "lg:text-right text-left col-span-2" : "lg:text-right text-left"
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
            </div>
            <div className="lg:grid lg:grid-cols-2 items-center lg:block hidden">
            <div className={`text-white text-xs text-right`}>
              200 <span className="text-grey1">DAI</span> - 201{" "}
              <span className="text-grey1">USDC</span>
            </div>
            <div className="text-right text-white text-xs lg:block hidden">
              {!isModal && <span>$401 </span>}
            </div>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}
