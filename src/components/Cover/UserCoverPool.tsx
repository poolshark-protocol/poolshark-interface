import { useEffect, useState } from "react";
import { useCoverStore } from "../../hooks/useCoverStore";
import { fetchCoverTokenUSDPrice, logoMap } from "../../utils/tokens";
import { TickMath } from "../../utils/math/tickMath";
import { getClaimTick } from "../../utils/maps";
import { tokenCover } from "../../utils/types";
import ArrowRightIcon from "../Icons/ArrowRightIcon";
import router from "next/router";
import { getCoverPoolFromFactory } from "../../utils/queries";
import { ethers } from "ethers";

export default function UserCoverPool({
  coverPosition,
  lowerPrice,
  upperPrice,
  href,
}) {
  const [
    tokenIn,
    tokenOut,
    setCoverPositionData,
    setTokenIn,
    setTokenOut,
    setClaimTick,
    setCoverPoolFromVolatility,
    setNeedsAllowance,
    setNeedsBalance,
  ] = useCoverStore((state) => [
    state.tokenIn,
    state.tokenOut,
    state.setCoverPositionData,
    state.setTokenIn,
    state.setTokenOut,
    state.setClaimTick,
    state.setCoverPoolFromVolatility,
    state.setNeedsAllowance,
    state.setNeedsBalance,
  ]);

  ///////////////////////////Claim Tick and filled Percent for Tile & set position USD price

  const [claimPrice, setClaimPrice] = useState(0);
  // fill percent is % of range crossed based on price
  const [fillPercent, setFillPercent] = useState("0");
  const [positionUSDPrice, setPositionUSDPrice] = useState("0");

  useEffect(() => {
    updateClaimTick();
    getPositionUSDValue();
  }, [coverPosition]);

  const updateClaimTick = async () => {
    const tick = await getClaimTick(
      coverPosition.poolId,
      Number(coverPosition.min),
      Number(coverPosition.max),
      Boolean(coverPosition.zeroForOne),
      Number(coverPosition.epochLast),
      true
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

  const getPositionUSDValue = async () => {
    const positionOutUSDPrice =
      Number(
        ethers.utils.formatUnits(
          coverPosition.userFillOut,
          coverPosition.zeroForOne
            ? coverPosition.tokenZero.decimals
            : coverPosition.tokenOne.decimals
        )
      ) *
      Number(
        coverPosition.zeroForOne
          ? coverPosition.valueTokenZero
          : coverPosition.valueTokenOne
      );
    const positionInUSDPrice =
      Number(
        ethers.utils.formatUnits(
          coverPosition.userFillIn,
          coverPosition.zeroForOne
            ? coverPosition.tokenOne.decimals
            : coverPosition.tokenZero.decimals
        )
      ) *
      Number(
        coverPosition.zeroForOne
          ? coverPosition.valueTokenOne
          : coverPosition.valueTokenZero
      );
    setPositionUSDPrice(
      Number(positionOutUSDPrice + positionInUSDPrice).toFixed(2)
    );
  };

  //////////////////////////Set Position when selected

  async function choosePosition() {
    setCoverPositionData(coverPosition);
    setNeedsAllowance(true);
    setNeedsBalance(true);
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
    setCoverPoolFromVolatility(
      tokenInNew,
      tokenOutNew,
      coverPosition.volatilityTier.feeAmount.toString()
    );
    router.push({
      pathname: href,
      query: {
        positionId: coverPosition.positionId,
      },
    });
  }

  return (
    <>
      <div className="relative" onClick={choosePosition}>
        <div className="lg:grid lg:grid-cols-2 lg:items-center w-full items-center bg-black px-4 py-3 rounded-[4px] border-grey border hover:bg-main1/20 cursor-pointer">
          <div className="grid sm:grid-cols-2 grid-rows-2 sm:grid-rows-1 items-center gap-y-2 w-full">
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
                {(Number(coverPosition.pool.volatilityTier.tickSpread) / 100) *
                  (60 /
                    Number(coverPosition.pool.volatilityTier.auctionLength))}
                %
              </span>
            </div>
            <div className="text-white lg:text-right text-left  text-xs">
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
          </div>
          <div className="lg:grid lg:grid-cols-2 items-center lg:block hidden">
            <div className="md:flex hidden items-center justify-end w-full">
              <div className="flex relative bg-transparent items-center justify-center h-8 border-grey z-40 border rounded-[4px] gap-x-2 text-sm w-40">
                <div className={`bg-white h-full absolute left-0 z-0 rounded-l-[4px] opacity-10 w-[${parseInt(fillPercent)}%]`}/>
                <div className="z-20 text-white text-xs">
                  {fillPercent}% Filled
                </div>
              </div>
            </div>
            <div className="text-right text-white text-xs lg:block hidden">
              <span>${positionUSDPrice}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
