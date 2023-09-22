import { logoMap } from "../../utils/tokens";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { useRouter } from "next/router";

export default function RangePool({ rangePool, href }) {
  const [setRangeTokenIn, setRangeTokenOut, setRangePoolFromVolatility] =
    useRangeLimitStore((state) => [
      state.setTokenIn,
      state.setTokenOut,
      state.setRangePoolFromVolatility,
    ]);

  const router = useRouter();

  const chooseRangePool = () => {
    const tokenIn = {
      name: rangePool.tokenZero.symbol,
      address: rangePool.tokenZero.id,
      logoURI: logoMap[rangePool.tokenZero.symbol],
      symbol: rangePool.tokenZero.symbol,
    };
    const tokenOut = {
      name: rangePool.tokenOne.symbol,
      address: rangePool.tokenOne.id,
      logoURI: logoMap[rangePool.tokenOne.symbol],
      symbol: rangePool.tokenOne.symbol,
    };
    setRangeTokenIn(tokenOut, tokenIn);
    setRangeTokenOut(tokenIn, tokenOut);
    const tier = {
      tier: rangePool.feeTier,
      id: rangePool.feeTier == "500" ? 0 : rangePool.feeTier == "3000" ? 1 : 2,
    };
    setRangePoolFromVolatility(tokenIn, tokenOut, tier);
    router.push({
      pathname: href,
    });
  };

  //console.log("rangePool mapped", rangePool);

  return (
    <>
      <div className="group relative cursor-pointer" onClick={chooseRangePool}>
        <div className="grid grid-cols-2 items-center bg-black hover:bg-main1/40 transition-all px-4 py-3 rounded-[4px] border-grey/50 border">
          <div className="flex items-center gap-x-6">
            <div className="flex items-center">
              <img
                className="w-[25px] h-[25px]"
                src={logoMap[rangePool.tokenZero.symbol]}
              />
              <img
                className="w-[25px] h-[25px] ml-[-8px]"
                src={logoMap[rangePool.tokenOne.symbol]}
              />
            </div>
            <span className="text-white text-xs flex items-center gap-x-1.5">
              {rangePool.tokenZero.symbol} - {rangePool.tokenOne.symbol}
            </span>
            <span className="bg-grey/50 rounded-[4px] text-grey1 text-xs px-3 py-0.5">
              {Number(rangePool.feeTier / 10000).toFixed(2)}%
            </span>
          </div>
          <div className=" grid-cols-3 grid items-center">
            <div className="text-white text-right text-xs">
              ${rangePool.volumeUsd}m
            </div>
            <div className="text-right text-white text-xs">
              ${rangePool.tvlUsd}m
            </div>
            <div className="text-right text-white text-xs">
              <span>${rangePool.feesUsd} </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
