import {
  ArrowsRightLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import { TickMath } from "../../utils/math/tickMath";
import { logoMap } from "../../utils/tokens";
import { useRangeStore } from "../../hooks/useRangeStore";
import {
  tokenOneAddress,
  tokenZeroAddress,
} from "../../constants/contractAddresses";
import { getRangePoolFromFactory } from "../../utils/queries";
import { ethers } from "ethers";
import Link from "next/link";

export default function UserPool({
  account,
  poolId,
  tokenZero,
  valueTokenZero,
  tokenOne,
  valueTokenOne,
  min,
  max,
  price,
  userLiquidity,
  userTokenAmount,
  feeTier,
  tickSpacing,
  tvlUsd,
  volumeUsd,
  volumeEth,
  href
}) {
  const [rangePrice, setRangePrice] = useState(undefined);
  const [rangeTickPrice, setRangeTickPrice] = useState(undefined);
  const [
    setTokenIn,
    setValueTokenIn,
    setTokenOut,
    setValueTokenOut,
    setMinTick,
    setMaxTick,
    setPrice,
    setUserLiquidity,
    setUserTokenAmount,
    setFeeTier,
    setTickSpacing,
    setTvlUsd,
    setVolumeUsd,
    setVolumeEth,
    setRangePoolAddress
  ] =
    useRangeStore((state) => [
      state.setTokenIn,
      state.setValueTokenIn,
      state.setTokenOut,
      state.setValueTokenOut,
      state.setMinTick,
      state.setMaxTick,
      state.setPrice,
      state.setUserLiquidity,
      state.setUserTokenAmount,
      state.setFeeTier,
      state.setTickSpacing,
      state.setTvlUsd,
      state.setVolumeUsd,
      state.setVolumeEth,
      state.setRangePoolAddress,
      state.setRangePoolData,
    ]);

  useEffect(() => {
    getRangePoolInfo();
  });

  const feeTierPercentage = feeTier / 10000;

  useEffect(() => {
    setRangeParams();
  }, [rangePrice]);

  const getRangePoolInfo = async () => {
    try {
      const pool = await getRangePoolFromFactory(
        tokenZeroAddress,
        tokenOneAddress
      );
      const dataLength = pool["data"]["rangePools"].length;
      if (dataLength > 0) {
        const id = pool["data"]["rangePools"]["0"]["id"];
        const price = pool["data"]["rangePools"]["0"]["price"];
        const tickAtPrice = pool["data"]["rangePools"]["0"]["tickAtPrice"];
        setRangePrice(parseFloat(TickMath.getPriceStringAtSqrtPrice(price)));
        setRangeTickPrice(Number(tickAtPrice));
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
      callId: tokenZero.id.localeCompare(tokenOne.id) < 0 ? 0 : 1,
      name: tokenZero.name,
      symbol: tokenZero.symbol,
      logoURI: logoMap[tokenZero.symbol],
      address: tokenZero.address,
    };
    const tokenOutNew = {
      callId: tokenOne.id.localeCompare(tokenZero.id) < 0 ? 0 : 1,
      name: tokenOne.name,
      symbol: tokenOne.symbol,
      logoURI: logoMap[tokenOne.symbol],
      address: tokenOne.address,
    };
    setTokenIn(tokenOutNew, tokenInNew);
    setTokenOut(tokenInNew, tokenOutNew);
    setMinTick(Number(min));
    setMaxTick(Number(max));
    setFeeTier(feeTier);
    setPrice(price);
    setValueTokenIn(valueTokenZero);
    setValueTokenOut(valueTokenOne);
    setUserLiquidity(userLiquidity);
    setUserTokenAmount(userTokenAmount);
    setTickSpacing(tickSpacing);
    setTvlUsd(tvlUsd);
    setVolumeUsd(volumeUsd);
    setVolumeEth(volumeEth);
    setRangePoolAddress(poolId);
  }

  return (
    <>
      <Link
        href={href}
      >
      <div onClick={choosePosition}>
        <div className="w-full cursor-pointer grid grid-cols-5 md:grid-cols-7 items-center w-full bg-dark border border-grey2 rounded-xl py-3.5 sm:pl-5 pl-3 md:pr-0 md:pr-5 pr-3 min-h-24 relative">
          <div className="space-y-3 col-span-5">
            <div className="flex items-center md:gap-x-5 gap-x-3">
              <div className="flex items-center ">
                <img
                  className="md:w-[30px] md:h-[30px] w-[25px] h-[25px]"
                  src={logoMap[tokenZero.symbol]}
                />
                <img
                  className="md:w-[30px] md:h-[30px] w-[25px] h-[25px] ml-[-8px]"
                  src={logoMap[tokenOne.symbol]}
                />
              </div>
              <div className="flex items-center gap-x-2 md:text-base text-sm">
                {tokenZero.symbol}
                <div>-</div>
                {tokenOne.symbol}
              </div>
              <div className="bg-black px-2 py-1 rounded-lg text-grey text-sm hidden md:block">
                {feeTierPercentage}%
              </div>
            </div>
            <div className="text-[10px] sm:text-xs grid grid-cols-5 items-center gap-x-3 md:pr-5">
              <span className="col-span-2">
                <span className="text-grey">Min:</span>{" "}
                {TickMath.getPriceStringAtTick(min)} {tokenOne.symbol} per{" "}
                {tokenZero.symbol}
              </span>
              <div className="flex items-center justify-center col-span-1">
                <ArrowsRightLeftIcon className="w-3 sm:w-4 text-grey" />
              </div>
              <span className="col-span-2">
                <span className="text-grey">Max:</span>{" "}
                {TickMath.getPriceStringAtTick(max)} {tokenOne.symbol} per{" "}
                {tokenZero.symbol}
              </span>
            </div>
          </div>
          <div className="md:col-span-2 flex gap-x-5 w-full flex-row-reverse md:flex-row items-center col-span-5 md:mx-5 mt-3 md:mt-0">
            <div className="bg-black  px-10 py-2 rounded-lg text-grey text-xs md:hidden block">
              {feeTierPercentage}%
            </div>

            <div className="w-full md:mr-10">
              {rangeTickPrice ? (
                Number(rangeTickPrice) < Number(min) ||
                Number(rangeTickPrice) >= Number(max) ? (
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
      </div>
      </Link>
    </>
  );
}
