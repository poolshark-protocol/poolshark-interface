import {
  ArrowsRightLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import { TickMath } from "../../utils/math/tickMath";
import { logoMap } from "../../utils/tokens";
import { useRangeStore } from "../../hooks/useRangeStore";
import { ethers } from "ethers";
import Link from "next/link";
import { getCoverPool, getRangePool, volatilityTiers } from "../../utils/pools";
import { token } from "../../utils/types";
import { useCoverStore } from "../../hooks/useCoverStore";

export default function UserPool({ rangePosition, href }) {
  const [
    rangeTokenIn,
    rangeTokenOut,
    setRangeTokenIn,
    setRangeTokenOut,
    setRangePoolAddress,
    setRangePoolData,
    setRangePositionData,
  ] = useRangeStore((state) => [
    state.tokenIn,
    state.tokenOut,
    state.setTokenIn,
    state.setTokenOut,
    state.setRangePoolAddress,
    state.setRangePoolData,
    state.setRangePositionData,
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

  const [rangePrice, setRangePrice] = useState(undefined);
  const [rangeTickPrice, setRangeTickPrice] = useState(undefined);

  useEffect(() => {
    getRangePoolInfo();
  }, []);

  useEffect(() => {
    setRangeParams();
  }, [rangePrice]);

  const getRangePoolInfo = async () => {
    try {
      if (rangePosition) {
        setRangePrice(
          parseFloat(TickMath.getPriceStringAtSqrtPrice(rangePosition.price))
        );
        setRangeTickPrice(Number(rangePosition.tickAtPrice));
      }
    } catch (error) {
      console.log(error);
    }
  };

  function setRangeParams() {
    try {
      if (rangePrice) {
        const price = TickMath.getTickAtPriceString(rangePrice);
        setRangeTickPrice(ethers.utils.parseUnits(String(price), 0));
      }
    } catch (error) {
      console.log(error);
    }
  }

  function choosePosition() {
    const tokenInNew = {
      name: rangePosition.tokenZero.name,
      symbol: rangePosition.tokenZero.symbol,
      logoURI: logoMap[rangePosition.tokenZero.symbol],
      address: rangePosition.tokenZero.id,
    } as token;
    const tokenOutNew = {
      name: rangePosition.tokenOne.name,
      symbol: rangePosition.tokenOne.symbol,
      logoURI: logoMap[rangePosition.tokenOne.symbol],
      address: rangePosition.tokenOne.id,
    } as token;
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
          <div className="w-full cursor-pointer grid grid-cols-5 md:grid-cols-7 items-center w-full bg-dark border border-grey2 rounded-xl py-3.5 sm:pl-5 pl-3 md:pr-0 md:pr-5 pr-3 min-h-24 relative">
            <div className="space-y-3 col-span-5">
              <div className="flex items-center md:gap-x-5 gap-x-3">
                <div className="flex items-center ">
                  <img
                    className="md:w-[30px] md:h-[30px] w-[25px] h-[25px]"
                    src={logoMap[rangePosition.tokenZero.symbol]}
                  />
                  <img
                    className="md:w-[30px] md:h-[30px] w-[25px] h-[25px] ml-[-8px]"
                    src={logoMap[rangePosition.tokenOne.symbol]}
                  />
                </div>
                <div className="flex items-center gap-x-2 md:text-base text-sm">
                  {rangePosition.tokenZero.symbol}
                  <div>-</div>
                  {rangePosition.tokenOne.symbol}
                </div>
                <div className="bg-black px-2 py-1 rounded-lg text-grey text-sm hidden md:block">
                  {Number(Number(rangePosition.feeTier) / 10000).toFixed(2)}%
                </div>
              </div>
              <div className="text-[10px] sm:text-xs grid grid-cols-5 items-center gap-x-3 md:pr-5">
                <span className="col-span-2">
                  <span className="text-grey">Min:</span>{" "}
                  {TickMath.getPriceStringAtTick(Number(rangePosition.min))}{" "}
                  {rangePosition.tokenOne.symbol} per{" "}
                  {rangePosition.tokenZero.symbol}
                </span>
                <div className="flex items-center justify-center col-span-1">
                  <ArrowsRightLeftIcon className="w-3 sm:w-4 text-grey" />
                </div>
                <span className="col-span-2">
                  <span className="text-grey">Max:</span>{" "}
                  {TickMath.getPriceStringAtTick(Number(rangePosition.max))}{" "}
                  {rangePosition.tokenOne.symbol} per{" "}
                  {rangePosition.tokenZero.symbol}
                </span>
              </div>
            </div>
            <div className="md:col-span-2 flex gap-x-5 w-full flex-row-reverse md:flex-row items-center col-span-5 md:mx-5 mt-3 md:mt-0">
              <div className="bg-black  px-10 py-2 rounded-lg text-grey text-xs md:hidden block">
                {Number(Number(rangePosition.feeTier) / 10000).toFixed(2)}%
              </div>

              <div className="w-full md:mr-10">
                {rangeTickPrice ? (
                  Number(rangeTickPrice) < Number(rangePosition.min) ||
                  Number(rangeTickPrice) >= Number(rangePosition.max) ? (
                    <div className="flex items-center justify-center w-full bg-black py-2 px-5 rounded-lg gap-x-2 text-xs whitespace-nowrap ">
                      <ExclamationTriangleIcon className="w-4 text-yellow-600" />
                      Out of Range
                    </div>
                  ) : (
                    <div className="flex items-center bg-black justify-center w-fiull py-2 px-5 rounded-lg gap-x-2 text-xs whitespace-nowrap">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      In Range
                    </div>
                  )
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}
