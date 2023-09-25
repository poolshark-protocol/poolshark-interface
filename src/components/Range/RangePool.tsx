import { logoMap } from "../../utils/tokens";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { useRouter } from "next/router";

export default function RangePool({ rangePool, href }) {
  const [setRangeTokenIn, setRangeTokenOut, setRangePoolFromFeeTier] =
    useRangeLimitStore((state) => [
      state.setTokenIn,
      state.setTokenOut,
      state.setRangePoolFromFeeTier,
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
    setRangePoolFromFeeTier(tokenIn, tokenOut, rangePool.feeTier);
    router.push({
      pathname: href,
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
                src={logoMap[rangePool.tokenZero.symbol]}
              />
              <img
                className="w-[25px] h-[25px] ml-[-8px]"
                src={logoMap[rangePool.tokenOne.symbol]}
              />
            </div>
            <span className="text-white text-xs flex items-center gap-x-1.5 whitespace-nowrap">
              {rangePool.tokenZero.symbol} - {rangePool.tokenOne.symbol}
            </span>
            <span className="bg-grey/50 rounded-[4px] text-grey1 text-xs px-3 py-0.5">
              {Number(rangePool.feeTier / 10000).toFixed(2)}%
            </span>
          </div>
          <div className="md:grid hidden grid-cols-3 w-full justify-end text-right items-center">
            <div className="text-white text-right text-xs">${rangePool.volumeUsd}m</div>
            <div className="text-right text-white text-xs">${rangePool.tvlUsd}m</div>
            <div className="text-right text-white text-xs">
              <span>${rangePool.feesUsd} </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
