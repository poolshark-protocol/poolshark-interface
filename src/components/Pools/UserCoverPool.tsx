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
import { token } from "../../utils/types";
import { getCoverPool } from "../../utils/pools";

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
    } as token;
    const tokenOutNew = {
      name: coverPosition.tokenOne.name,
      symbol: coverPosition.tokenOne.symbol,
      logoURI: logoMap[coverPosition.tokenOne.symbol],
      address: coverPosition.tokenOne.id,
    } as token;
    setTokenIn(tokenOutNew, tokenInNew);
    setTokenOut(tokenInNew, tokenOutNew);
    getCoverPool(tokenIn, tokenOut, setCoverPoolAddress, setCoverPoolData);
  }

  return (
    <>
      <div onClick={choosePosition}>
        <Link
          href={{
            pathname: href,
          }}
        >
          <div className="w-full cursor-pointer grid grid-cols-5 md:grid-cols-7 items-center w-full bg-dark border border-grey2 rounded-xl py-3.5 sm:pl-5 pl-3 md:pr-0 md:pr-5 pr-3 min-h-24 relative">
            <div className="space-y-3 col-span-5">
              <div className="flex items-center gap-x-5">
                <div className="flex items-center ">
                  <img
                    className="md:w-[30px] md:h-[30px] w-[25px] h-[25px]"
                    src={logoMap[coverPosition.tokenZero.symbol]}
                  />
                  <img
                    className="md:w-[30px] md:h-[30px] w-[25px] h-[25px] ml-[-8px]"
                    src={logoMap[coverPosition.tokenOne.symbol]}
                  />
                </div>
                <div className="flex items-center gap-x-2 md:text-base text-sm">
                  {coverPosition.tokenZero.symbol}
                  <ArrowLongRightIcon className="w-5" />
                  {coverPosition.tokenOne.symbol}
                </div>
                <div className="bg-black px-2 py-1 rounded-lg text-grey text-sm hidden md:block">
                  {Number(Number(coverPosition.feeTier) / 10000).toFixed(2)}%
                </div>
              </div>
              <div className="text-[10px] sm:text-xs grid grid-cols-5 items-center gap-x-3 md:pr-5">
                <span className="col-span-2">
                  <span className="text-grey">Min:</span>
                  {TickMath.getPriceStringAtTick(
                    Number(coverPosition.min)
                  )}{" "}
                  {coverPosition.zeroForOne
                    ? coverPosition.tokenOne.symbol
                    : coverPosition.tokenZero.symbol}{" "}
                  per{" "}
                  {coverPosition.zeroForOne
                    ? coverPosition.tokenZero.symbol
                    : coverPosition.tokenOne.symbol}
                </span>
                <div className="flex items-center justify-center col-span-1">
                  <ArrowsRightLeftIcon className="w-4 text-grey" />
                </div>
                <span className="col-span-2">
                  <span className="text-grey">Max:</span>
                  {TickMath.getPriceStringAtTick(
                    Number(coverPosition.max)
                  )}{" "}
                  {coverPosition.zeroForOne
                    ? coverPosition.tokenOne.symbol
                    : coverPosition.tokenZero.symbol}{" "}
                  per{" "}
                  {coverPosition.zeroForOne
                    ? coverPosition.tokenZero.symbol
                    : coverPosition.tokenOne.symbol}
                </span>
              </div>
            </div>
            <div className="md:col-span-2 flex gap-x-5 w-full flex-row-reverse md:flex-row items-center col-span-5 mt-3 md:mt-0 md:mr-10">
              <div className="bg-black  px-10 py-2 rounded-lg text-grey text-xs md:hidden block">
                {Number(Number(coverPosition.feeTier) / 10000).toFixed(2)}%
              </div>

              <div className="flex relative bg-transparent items-center justify-center h-8 border-grey1 z-40 border rounded-lg gap-x-2 text-sm w-full">
                <div
                  className={`bg-white h-full absolute left-0 z-0 rounded-l-[7px] opacity-10 w-[${fillPercent}%]`}
                />
                <div className="z-20 ">{fillPercent}% Filled</div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}
