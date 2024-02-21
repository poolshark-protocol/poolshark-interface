import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { useRouter } from "next/router";
import { formatUsdValue, getFeeApy } from "../../utils/math/valueMath";
import { useConfigStore } from "../../hooks/useConfigStore";
import { SparklesIcon, InformationCircleIcon } from "@heroicons/react/20/solid";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { isWhitelistedPool } from "../../utils/config";

export default function RangePool({ rangePool, href }) {
  const [limitSubgraph, logoMap, chainId, networkName] = useConfigStore(
    (state) => [
      state.limitSubgraph,
      state.logoMap,
      state.chainId,
      state.networkName,
    ]
  );

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
        chainId: chainId,
      },
    });
  };

  return (
    <>
      <div className="group relative cursor-pointer" onClick={chooseRangePool}>
        <div className="md:grid flex flex-col gap-y-4 grid-cols-2 md:items-center bg-black hover:bg-main1/40 transition-all px-4 py-3 rounded-[4px] border-grey/50 border">
          <div className="flex items-center w-full md:gap-x-6 gap-x-3">
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
          <div className="grid grid-cols-1 md:grid-cols-4 md:w-full justify-end text-right items-center">
            <div className="text-white md:block hidden text-right text-xs">
              ${formatUsdValue(rangePool.volumeUsd)}
            </div>
            <div className="text-right md:block hidden text-white text-xs">
              ${formatUsdValue(rangePool.tvlUsd)}
            </div>
            <div className="text-right md:block hidden text-white text-xs">
              <span>${formatUsdValue(rangePool.feesUsd)} </span>
            </div>
            <div className="text-right text-white text-xs flex items-center md:justify-end justify-between">
              <span className="md:hidden">APY</span>
              {isWhitelistedPool(rangePool, networkName) ? (
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger>
                    <div>
                      <span className="text-main2 flex items-center justify-end gap-x-3">
                        <div className="flex items-center gap-x-1.5">
                          <InformationCircleIcon className="w-4 text-grey" />
                            <SparklesIcon className="w-[18px]" />
                          <span
                            className="text-main2"
                          >
                            9.45%
                          </span>
                        </div>
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent onClick={(e) => e.stopPropagation()} className="bg-dark text-xs rounded-[4px] border border-grey w-40 py-3 cursor-default">
                    <div className="flex items-center flex-col gap-y-1 w-full">
                      <div className="flex flex-col items-start ">
                      <span className="text-grey2 text-xs">oFIN Strike Price</span>

                     <div className="relative">
                      <span className="absolute left-3 top-[16.5px] text-grey1">$</span>
                     <input className="w-full bg-black border border-grey py-2 pl-6 outline-none rounded-[4px] my-2" value={2.5}  />
                     </div>
                      </div>
                      <div className="w-full h-[1px] bg-grey"/>
                      
                        <div className="flex justify-between items-center w-full mt-2">
                          <span className="text-grey2">oFIN</span>
                          {/* TODO: use 24h fees for Fee APY */}
                          <span className="text-main2 flex items-center gap-x-1">
                            5%
                          </span>
                        </div>
                      <div className="flex justify-between items-center w-full">
                        <span className="text-grey2">Fee APY</span>
                        {/* TODO: use 24h fees for Fee APY */}
                        <span className="text-right">
                          {getFeeApy(rangePool)}%
                        </span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>) :
              (
                <span className="text-white flex items-center justify-end gap-x-3">
                        <div className="flex items-center gap-x-1.5">
                            9.45%
                        </div>
                      </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
