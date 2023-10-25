import { useEffect } from "react";
import { getClaimTick } from "../../utils/maps";
import { BigNumber, ethers } from "ethers";
import { getAveragePrice, getExpectedAmountOut, getExpectedAmountOutFromInput } from "../../utils/math/priceMath";
import LimitSwapBurnButton from "../Buttons/LimitSwapBurnButton";
import { tokenRangeLimit } from "../../utils/types";
import router from "next/router";
import { logoMap } from "../../utils/tokens";
import timeDifference from "../../utils/time";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { parseUnits } from "../../utils/math/valueMath";
import { useConfigStore } from "../../hooks/useConfigStore";

export default function UserLimitPool({
    limitPosition,
    limitFilledAmount,
    address,
    href,
}) {
    const [
        limitSubgraph,
        coverSubgraph
      ] = useConfigStore((state) => [
        state.limitSubgraph,
        state.coverSubgraph
      ]);

    const [
        tokenIn,
        tokenOut,
        setLimitPositionData,
        setLimitPoolAddress,
        setTokenIn,
        setTokenOut,
        setClaimTick,
        setLimitPoolFromVolatility,
        setNeedsAllowanceIn,
        setNeedsBalanceIn,
    ] = useRangeLimitStore((state) => [
        state.tokenIn,
        state.tokenOut,
        state.setLimitPositionData,
        state.setLimitPoolAddress,
        state.setTokenIn,
        state.setTokenOut,
        state.setClaimTick,
        state.setLimitPoolFromVolatility,
        state.setNeedsAllowanceIn,
        state.setNeedsBalanceIn,
    ]);

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
            limitSubgraph
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
            logoURI: logoMap[limitPosition.tokenIn.symbol],
            address: limitPosition.tokenIn.id,
        } as tokenRangeLimit;
        const tokenOutNew = {
            name: limitPosition.tokenOut.name,
            symbol: limitPosition.tokenOut.symbol,
            logoURI: logoMap[limitPosition.tokenOut.symbol],
            address: limitPosition.tokenOut.id,
        } as tokenRangeLimit;
        setTokenIn(tokenOutNew, tokenInNew);
        setTokenOut(tokenInNew, tokenOutNew);
        setLimitPoolFromVolatility(
            tokenInNew,
            tokenOutNew,
            limitPosition.feeTier.toString(),
            limitSubgraph,
        );
        router.push({
            pathname: href,
            query: {
                positionId: limitPosition.positionId,
            },
        });
    }

    return (
        <tr className="text-right text-xs md:text-sm bg-black hover:bg-dark cursor-pointer"
            key={limitPosition.positionId}
            onClick={choosePosition}
        >
            <td className="py-3 pl-3">
                <div className="flex items-center text-xs text-grey1 gap-x-2 text-left">
                    <img
                        className="w-[23px] h-[23px]"
                        src={logoMap[limitPosition.tokenIn.symbol]}
                    />
                    {parseFloat(ethers.utils.formatEther(limitPosition.amountIn)).toFixed(3) + " " + limitPosition.tokenIn.symbol}
                </div>
            </td>
            <td className="">
                <div className="flex items-center text-xs text-white gap-x-2 text-left">
                    <img
                        className="w-[23px] h-[23px]"
                        src={logoMap[limitPosition.tokenOut.symbol]}
                    />
                    {parseFloat(ethers.utils.formatEther(
                        getExpectedAmountOut(
                            parseInt(limitPosition.min),
                            parseInt(limitPosition.max),
                            limitPosition.tokenIn.id.localeCompare(limitPosition.tokenOut.id) < 0,
                            BigNumber.from(limitPosition.liquidity))
                    )).toFixed(3) + " " + limitPosition.tokenOut.symbol}
                </div>
            </td>
            <td className="text-left text-xs">
                <div className="flex flex-col">
                    <span>
                        <span className="text-grey1">1 {limitPosition.tokenIn.symbol} = </span>
                        {
                            getAveragePrice(
                                tokenIn,
                                tokenOut,
                                parseInt(limitPosition.min),
                                parseInt(limitPosition.max),
                                limitPosition.tokenIn.id.localeCompare(limitPosition.tokenOut.id) < 0,
                                BigNumber.from(limitPosition.liquidity),
                                BigNumber.from(limitPosition.amountIn)
                            ).toFixed(3) + " " + limitPosition.tokenOut.symbol}
                    </span>
                </div>
            </td>
            <td className="md:table-cell hidden">
                <div className="text-white bg-black border border-grey relative flex items-center justify-center h-7 rounded-[4px] text-center text-[10px]">
                    <span className="z-50 px-3">
                    {(limitFilledAmount /
                         parseFloat(
                           ethers.utils.formatUnits(
                             getExpectedAmountOutFromInput(
                               parseInt(limitPosition.min),
                               parseInt(limitPosition.max),
                               limitPosition.tokenIn.id.localeCompare(limitPosition.tokenOut.id) < 0,
                               BigNumber.from(limitPosition.amountIn)
                           ), limitPosition.tokenOut.decimals
                         ))).toFixed(2)}% Filled
                    </span>
                    <div className="h-full bg-grey/60 w-[0%] absolute left-0" />
                </div>
            </td>
            <td className="text-grey1 text-left pl-3 text-xs md:table-cell hidden">{timeDifference(limitPosition.timestamp)}</td>
            <td className="text-sm text-grey1 md:table-cell hidden">
                <LimitSwapBurnButton
                    poolAddress={limitPosition.poolId}
                    address={address}
                    positionId={BigNumber.from(limitPosition.positionId)}
                    epochLast={limitPosition.epochLast}
                    zeroForOne={limitPosition.tokenIn.id.localeCompare(limitPosition.tokenOut.id) < 0}
                    lower={BigNumber.from(limitPosition.min)}
                    upper={BigNumber.from(limitPosition.max)}
                    burnPercent={parseUnits("1", 38)}
                />
            </td>
        </tr>
    );
}