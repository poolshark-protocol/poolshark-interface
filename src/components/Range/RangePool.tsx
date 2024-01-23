import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { useRouter } from "next/router";
import { formatUsdValue } from "../../utils/math/valueMath";
import { useConfigStore } from "../../hooks/useConfigStore";
import { SparklesIcon, InformationCircleIcon } from "@heroicons/react/20/solid";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"

export default function RangePool({ rangePool, href }) {
  const [limitSubgraph, logoMap] = useConfigStore((state) => [
    state.limitSubgraph,
    state.logoMap,
  ]);

  const [
    setRangeTokenIn,
    setRangeTokenOut,
    setRangePoolFromFeeTier,
    resetMintParams,
    resetPoolData,
  ] = useRangeLimitStore((state) => [
    state.setTokenIn,
    state.setTokenOut,
    state.setRangePoolFromFeeTier,
    state.resetMintParams,
    state.resetPoolData,
  ]);

  const router = useRouter();

  const chooseRangePool = () => {
    resetMintParams();
    resetPoolData();
    const tokenIn = {
      name: rangePool.tokenZero.symbol,
      address: rangePool.tokenZero.id,
      logoURI: logoMap[rangePool.tokenZero.id],
      symbol: rangePool.tokenZero.symbol,
      decimals: rangePool.tokenZero.decimals,
    };
    const tokenOut = {
      name: rangePool.tokenOne.symbol,
      address: rangePool.tokenOne.id,
      logoURI: logoMap[rangePool.tokenOne.id],
      symbol: rangePool.tokenOne.symbol,
      decimals: rangePool.tokenOne.decimals,
    };
    setRangeTokenIn(tokenOut, tokenIn, "0", true);
    setRangeTokenOut(tokenIn, tokenOut, "0", false);
    // setRangePoolFromFeeTier(tokenIn, tokenOut, rangePool.feeTier);
    router.push({
      pathname: href,
      query: {
        feeTier: rangePool.feeTier,
        poolId: rangePool.poolId,
      },
    });
  };

  return (
    <>
      <div className="group relative cursor-pointer" onClick={chooseRangePool}>
        <div className="grid md:grid-cols-2 items-center bg-black hover:bg-main1/40 transition-all px-4 py-3 rounded-[4px] border-grey/50 border">
          <div className="flex items-center md:gap-x-6 gap-x-3">
            <div className="flex items-center">
              <img
                className="w-[25px] h-[25px]"
                src={logoMap[rangePool.tokenZero.id]}
              />
              <img
                className="w-[25px] h-[25px] ml-[-8px]"
                src={logoMap[rangePool.tokenOne.id]}
              />
            </div>
            <span className="text-white text-xs flex items-center gap-x-1.5 whitespace-nowrap">
              {rangePool.tokenZero.symbol} - {rangePool.tokenOne.symbol}
            </span>
            <span className="bg-grey/50 rounded-[4px] text-grey1 text-xs px-3 py-0.5">
              {Number(rangePool.feeTier / 10000).toFixed(2)}%
            </span>
          </div>
          <div className="md:grid hidden grid-cols-4 w-full justify-end text-right items-center">
            <div className="text-white text-right text-xs">
              ${formatUsdValue(rangePool.volumeUsd)}
            </div>
            <div className="text-right text-white text-xs">
              ${formatUsdValue(rangePool.tvlUsd)}
            </div>
            <div className="text-right text-white text-xs">
              <span>${formatUsdValue(rangePool.feesUsd)} </span>
            </div>
            <div className="text-right text-white text-xs">
            <TooltipProvider>
  <Tooltip delayDuration={100}>
    <TooltipTrigger>
      <div>{/*<span>5.4% </span> */}
            <span className="text-main2 flex items-center justify-end gap-x-3">
            <InformationCircleIcon className="w-4 text-grey"/>
              <div className="flex items-center gap-x-1.5">
              <SparklesIcon className="w-3"/>
              5.4% 
              </div>
              </span>
              </div>
            </TooltipTrigger>
    <TooltipContent className="bg-dark text-xs rounded-[4px] border border-grey w-40 py-3">
      <div className="flex items-center flex-col gap-y-1 w-full">
        <div className="flex justify-between items-center w-full">
        <span className="text-grey2">Base APY</span>
        <span className="text-right">2.4%</span>
        </div>
        <div className="flex justify-between items-center w-full">
        <span className="text-grey2 flex items-center gap-x-1">Incentives <SparklesIcon className="w-3"/> </span>
        <span className="text-right text-white "> 3%</span>
        </div>
        <div className="bg-grey w-full h-[1px]"/>
        <div className="flex justify-between items-center w-full">
        <span className="text-grey1">Total</span>
        <span className="text-right text-main2">5.4%</span>
        </div>
      </div>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
</div>
          </div>
        </div>
      </div>
    </>
  );
}
