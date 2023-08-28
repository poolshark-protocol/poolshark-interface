import { logoMap } from "../../utils/tokens";
import { useRangeStore } from "../../hooks/useRangeStore";
import { useCoverStore } from "../../hooks/useCoverStore";
import { useRouter } from "next/router";
import { tokenCover } from "../../utils/types";

export default function RangePool({
  poolId,
  account,
  tokenOne,
  tokenZero,
  liquidity,
  feeTier,
  auctionLenght,
  tickSpacing,
  tvlUsd,
  volumeUsd,
  volumeEth,
  href,
}) {
  const [setRangeTokenIn, setRangeTokenOut, setRangePoolFromVolatility] =
    useRangeStore((state) => [
      state.setTokenIn,
      state.setTokenOut,
      state.setRangePoolFromVolatility,
    ]);

  const router = useRouter();

  const chooseRangePool = () => {
    const tokenIn = {
      name: tokenZero.symbol,
      address: tokenZero.id,
      logoURI: logoMap[tokenZero.symbol],
      symbol: tokenZero.symbol,
    };
    const tokenOut = {
      name: tokenOne.symbol,
      address: tokenOne.id,
      logoURI: logoMap[tokenOne.symbol],
      symbol: tokenOne.symbol,
    };
    setRangeTokenIn(tokenOut, tokenIn);
    setRangeTokenOut(tokenIn, tokenOut);
    const tier = {
      tier: feeTier,
      id: feeTier == "500" ? 0 : feeTier == "3000" ? 1 : 2,
    };
    setRangePoolFromVolatility(tokenIn, tokenOut, tier);
    router.push({
      pathname: href,
    });
  };

  return (
    <>
      <div className="group relative cursor-pointer" onClick={chooseRangePool}>
        <div className="grid grid-cols-2 items-center bg-black hover:bg-main1/40 transition-all px-4 py-3 rounded-[4px] border-grey/50 border">
          <div className="flex items-center gap-x-6">
            <div className="flex items-center">
              <img
                className="w-[25px] h-[25px]"
                src={logoMap[tokenZero.symbol]}
              />
              <img
                className="w-[25px] h-[25px] ml-[-8px]"
                src={logoMap[tokenOne.symbol]}
              />
            </div>
            <span className="text-white text-xs flex items-center gap-x-1.5">
              {tokenZero.symbol} - {tokenOne.symbol}
            </span>
            <span className="bg-grey/50 rounded-[4px] text-grey1 text-xs px-3 py-0.5">
              {Number(feeTier / 10000).toFixed(2)}%
            </span>
          </div>
          <div className=" grid-cols-3 grid items-center">
            <div className="text-white text-right text-xs">${volumeUsd}m</div>
            <div className="text-right text-white text-xs">${tvlUsd}m</div>
            <div className="text-right text-white text-xs">
              <span>$401 </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
