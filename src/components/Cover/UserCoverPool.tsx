import {
  ArrowsRightLeftIcon,
  ArrowLongRightIcon,
} from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import { useCoverStore } from "../../hooks/useCoverStore";
import Link from "next/link";
import { logoMap } from "../../utils/tokens";
import { TickMath } from "../../utils/math/tickMath";
import { getClaimTick } from "../../utils/maps";
import { tokenCover } from "../../utils/types";
import { getCoverPool } from "../../utils/pools";
import ArrowRightIcon from "../Icons/ArrowRightIcon";

export default function UserCoverPool({
  coverPosition,
  lowerPrice,
  upperPrice,
  href,
}) {
  const [
    claimTick,
    tokenIn,
    tokenOut,
    setCoverPoolData,
    setCoverPositionData,
    setCoverPoolAddress,
    setTokenIn,
    setTokenOut,
    setClaimTick,
    setCoverPoolFromVolatility,
  ] = useCoverStore((state) => [
    state.claimTick,
    state.tokenIn,
    state.tokenOut,
    state.setCoverPoolData,
    state.setCoverPositionData,
    state.setCoverPoolAddress,
    state.setTokenIn,
    state.setTokenOut,
    state.setClaimTick,
    state.setCoverPoolFromVolatility,
  ]);

  const [claimPrice, setClaimPrice] = useState(0);
  // fill percent is % of range crossed based on price
  const [fillPercent, setFillPercent] = useState("0");

  useEffect(() => {
    updateClaimTick();
  }, []);

  const updateClaimTick = async () => {
    const tick = await getClaimTick(
      coverPosition.poolId,
      Number(coverPosition.min),
      Number(coverPosition.max),
      Boolean(coverPosition.zeroForOne),
      Number(coverPosition.epochLast)
    );
    setClaimTick(tick);
    setClaimPrice(parseFloat(TickMath.getPriceStringAtTick(tick)));
    setFillPercent(
      (
        Math.abs(
          (Boolean(coverPosition.zeroForOne) ? upperPrice : lowerPrice) -
            claimPrice
        ) / Math.abs(upperPrice - lowerPrice)
      ).toPrecision(3)
    );
  };

  function choosePosition() {
    setCoverPositionData(coverPosition);
    const tokenInNew = {
      name: coverPosition.tokenZero.name,
      symbol: coverPosition.tokenZero.symbol,
      logoURI: logoMap[coverPosition.tokenZero.symbol],
      address: coverPosition.tokenZero.id,
    } as tokenCover;
    const tokenOutNew = {
      name: coverPosition.tokenOne.name,
      symbol: coverPosition.tokenOne.symbol,
      logoURI: logoMap[coverPosition.tokenOne.symbol],
      address: coverPosition.tokenOne.id,
    } as tokenCover;
    setTokenIn(tokenOutNew, tokenInNew);
    setTokenOut(tokenInNew, tokenOutNew);
    const vol0 = { id: 0 };
    const vol1 = { id: 1 };
    setCoverPoolFromVolatility(
      tokenInNew,
      tokenOutNew,
      coverPosition.volatilityTier.tickSpread == "20" ? vol0 : vol1
    );
  }

  //console.log("coverPosition", coverPosition);

  return (
    <>
      <div onClick={choosePosition}>
        <Link
          href={{
            pathname: href,
          }}
        >
          <div className="grid grid-cols-4 items-center bg-black px-4 py-3 rounded-[4px] border-grey border">
            <div className="flex items-center gap-x-6">
              <div className="flex items-center">
                <img
                  className="w-[25px] h-[25px]"
                  src={logoMap[coverPosition.tokenZero.symbol]}
                />
                <img
                  className="w-[25px] h-[25px] ml-[-8px]"
                  src={logoMap[coverPosition.tokenOne.symbol]}
                />
              </div>
              <span className="text-white text-xs flex items-center gap-x-1.5">
                {coverPosition.tokenZero.symbol} <ArrowRightIcon />{" "}
                {coverPosition.tokenOne.symbol}
              </span>
              <span className="bg-grey/50 rounded-[4px] text-grey1 text-xs px-3 py-0.5">
                {coverPosition.volatilityTier.tickSpread == "20"
                  ? "1.7"
                  : "2.4"}
                %
              </span>
            </div>
            <div className="text-white text-right text-xs">
              {TickMath.getPriceStringAtTick(Number(coverPosition.min))} -{" "}
              {TickMath.getPriceStringAtTick(Number(coverPosition.max))}{" "}
              <span className="text-grey1">
                {coverPosition.zeroForOne
                  ? coverPosition.tokenOne.symbol
                  : coverPosition.tokenZero.symbol}{" "}
                PER{" "}
                {coverPosition.zeroForOne
                  ? coverPosition.tokenZero.symbol
                  : coverPosition.tokenOne.symbol}
              </span>
            </div>
            <div className="flex items-center justify-end w-full">
              <div className="flex relative bg-transparent items-center justify-center h-8 border-grey z-40 border rounded-[4px] gap-x-2 text-sm w-40">
                <div
                  className={`bg-white h-full absolute left-0 z-0 rounded-l-[4px] opacity-10 w-[${fillPercent}%]`}
                />
                <div className="z-20 text-white text-xs">
                  {fillPercent}% Filled
                </div>
              </div>
            </div>
            <div className="text-right text-white text-xs">
              <span>$401 </span>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}
