import { useEffect } from "react";
import { getClaimTick } from "../../utils/maps";
import { BigNumber, ethers } from "ethers";
import {
  getAveragePrice,
  getExpectedAmountIn,
  getExpectedAmountOut,
  getExpectedAmountOutFromInput,
} from "../../utils/math/priceMath";
import { tokenRangeLimit } from "../../utils/types";
import router from "next/router";
import { timeDifference } from "../../utils/time";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { useConfigStore } from "../../hooks/useConfigStore";
import { invertPrice } from "../../utils/math/tickMath";
import { useShallow } from "zustand/react/shallow";

export default function UserLimitPool({
  limitPosition,
  limitFilledAmount,
  href,
}) {
  const [limitSubgraph, logoMap] = useConfigStore(
    useShallow((state) => [state.limitSubgraph, state.logoMap]),
  );

  const [
    tokenIn,
    tokenOut,
    setLimitPositionData,
    setTokenIn,
    setTokenOut,
    setClaimTick,
    setLimitPoolFromVolatility,
    setNeedsAllowanceIn,
    setNeedsBalanceIn,
  ] = useRangeLimitStore(
    useShallow((state) => [
      state.tokenIn,
      state.tokenOut,
      state.setLimitPositionData,
      state.setTokenIn,
      state.setTokenOut,
      state.setClaimTick,
      state.setLimitPoolFromVolatility,
      state.setNeedsAllowanceIn,
      state.setNeedsBalanceIn,
    ]),
  );

  ///////////////////////////Claim Tick
  useEffect(() => {
    updateClaimTick();
  }, [limitPosition]);

  const updateClaimTick = async () => {
    const tick = await getClaimTick(
      limitPosition.poolId,
      Number(limitPosition.min),
      Number(limitPosition.max),
      tokenIn.callId == 0,
      Number(limitPosition.epochLast),
      false,
      limitSubgraph,
      undefined,
    );
    setClaimTick(tick);
  };

  //////////////////////////Set Position when selected

  async function choosePosition() {
    setLimitPositionData(limitPosition);
    setNeedsAllowanceIn(true);
    setNeedsBalanceIn(true);
    const tokenInNew = {
      name: limitPosition.tokenIn.name,
      symbol: limitPosition.tokenIn.symbol,
      logoURI: logoMap[limitPosition.tokenIn.id],
      address: limitPosition.tokenIn.id,
      decimals: limitPosition.tokenIn.decimals,
    } as tokenRangeLimit;
    const tokenOutNew = {
      name: limitPosition.tokenOut.name,
      symbol: limitPosition.tokenOut.symbol,
      logoURI: logoMap[limitPosition.tokenOut.id],
      address: limitPosition.tokenOut.id,
      decimals: limitPosition.tokenOut.decimals,
    } as tokenRangeLimit;
    setTokenIn(tokenOutNew, tokenInNew, "0", true);
    setTokenOut(tokenInNew, tokenOutNew, "0", false);
    setLimitPoolFromVolatility(
      tokenInNew,
      tokenOutNew,
      limitPosition.feeTier.toString(),
      limitSubgraph,
      limitPosition.poolType,
    );
    router.push({
      pathname: href,
      query: {
        id: limitPosition.id,
      },
    });
  }

  const filledPercentRaw = (
    (limitFilledAmount * 100) /
    parseFloat(
      ethers.utils.formatUnits(
        getExpectedAmountOutFromInput(
          parseInt(limitPosition.min),
          parseInt(limitPosition.max),
          limitPosition.tokenIn.id.localeCompare(limitPosition.tokenOut.id) < 0,
          getExpectedAmountIn(
            parseInt(limitPosition.min),
            parseInt(limitPosition.max),
            limitPosition.tokenIn.id.localeCompare(limitPosition.tokenOut.id) <
              0,
            BigNumber.from(limitPosition.liquidity),
          ),
        ),
        limitPosition.tokenOut.decimals,
      ),
    )
  ).toFixed(1);
  const filledPercent = filledPercentRaw.endsWith(".0")
    ? filledPercentRaw.slice(0, -2)
    : filledPercentRaw;

  return (
    <tr
      className="text-right text-xs md:text-sm bg-black hover:bg-dark cursor-pointer"
      key={limitPosition.id}
      onClick={choosePosition}
    >
      <td className="py-3 pl-3">
        <div className="flex items-center text-xs text-grey1 gap-x-2 text-left">
          <img
            className="w-[23px] h-[23px]"
            src={logoMap[limitPosition.tokenIn.address]}
          />
          {parseFloat(
            ethers.utils.formatUnits(
              getExpectedAmountIn(
                parseInt(limitPosition.min),
                parseInt(limitPosition.max),
                limitPosition.tokenIn.id.localeCompare(
                  limitPosition.tokenOut.id,
                ) < 0,
                BigNumber.from(limitPosition.liquidity),
              ),
              limitPosition.tokenIn.decimals,
            ),
          ).toFixed(3) +
            " " +
            limitPosition.tokenIn.symbol}
        </div>
      </td>
      <td className="">
        <div className="flex items-center text-xs text-white gap-x-2 text-left">
          <img
            className="w-[23px] h-[23px]"
            src={logoMap[limitPosition.tokenOut.address]}
          />
          {parseFloat(
            ethers.utils.formatUnits(
              getExpectedAmountOut(
                parseInt(limitPosition.min),
                parseInt(limitPosition.max),
                limitPosition.tokenIn.id.localeCompare(
                  limitPosition.tokenOut.id,
                ) < 0,
                BigNumber.from(limitPosition.liquidity),
              ),
              limitPosition.tokenOut.decimals,
            ),
          ).toPrecision(6) +
            " " +
            limitPosition.tokenOut.symbol}
        </div>
      </td>
      <td className="text-left text-xs md:table-cell hidden">
        <div className="flex flex-col">
          <span>
            <span className="text-grey1">
              1 {limitPosition.tokenIn.symbol} ={" "}
            </span>
            {invertPrice(
              getAveragePrice(
                limitPosition.tokenIn,
                limitPosition.tokenOut,
                parseInt(limitPosition.min),
                parseInt(limitPosition.max),
                limitPosition.tokenIn.id.localeCompare(
                  limitPosition.tokenOut.id,
                ) < 0,
                BigNumber.from(limitPosition.liquidity),
                getExpectedAmountIn(
                  parseInt(limitPosition.min),
                  parseInt(limitPosition.max),
                  limitPosition.tokenIn.id.localeCompare(
                    limitPosition.tokenOut.id,
                  ) < 0,
                  BigNumber.from(limitPosition.liquidity),
                ),
              ).toPrecision(6),
              limitPosition.tokenIn.id.localeCompare(
                limitPosition.tokenOut.id,
              ) < 0,
            ) +
              " " +
              limitPosition.tokenOut.symbol}
          </span>
        </div>
      </td>
      <td className="pr-2 md:pr-0">
        <div
          className={`text-white bg-black border border-grey relative flex items-center justify-center h-7 rounded-[4px] text-center text-[10px]`}
        >
          <span className="z-50 px-3">{filledPercent}% Filled</span>
          <div
            style={{ width: filledPercent + "%" }}
            className="h-full bg-grey/60 absolute left-0"
          />
        </div>
      </td>
      <td className="text-grey1 text-left pl-3 text-xs md:table-cell hidden">
        {timeDifference(limitPosition.timestamp) != ""
          ? timeDifference(limitPosition.timestamp)
          : "0m "}{" "}
        ago
      </td>
      <td className="text-sm text-grey1 md:table-cell hidden">
        {/* <LimitSwapBurnButton
                    poolAddress={limitPosition.poolId}
                    address={address}
                    positionId={BigNumber.from(limitPosition.positionId)}
                    epochLast={limitPosition.epochLast}
                    zeroForOne={limitPosition.tokenIn.id.localeCompare(limitPosition.tokenOut.id) < 0}
                    lower={BigNumber.from(limitPosition.min)}
                    upper={BigNumber.from(limitPosition.max)}
                    burnPercent={parseUnits("1", 38)}
                /> */}
      </td>
    </tr>
  );
}
