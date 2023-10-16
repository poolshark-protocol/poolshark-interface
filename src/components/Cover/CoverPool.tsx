import { logoMap } from "../../utils/tokens";
import { useCoverStore } from "../../hooks/useCoverStore";
import { useRouter } from "next/router";
import { tokenCover } from "../../utils/types";
import { formatUsdValue } from "../../utils/math/valueMath";
import { TickMath } from "../../utils/math/tickMath";

export default function CoverPool({ pool, href }) {
  const [setCoverTokenIn, setCoverTokenOut, setCoverPoolFromVolatility] =
    useCoverStore((state) => [
      state.setTokenIn,
      state.setTokenOut,
      state.setCoverPoolFromVolatility,
    ]);

  const router = useRouter();

  const chooseCoverPool = () => {
    const tokenIn = {
      name: pool.tokenZero.symbol,
      address: pool.tokenZero.id,
      logoURI: logoMap[pool.tokenZero.symbol],
      symbol: pool.tokenZero.symbol,
    } as tokenCover;
    const tokenOut = {
      name: pool.tokenOne.symbol,
      address: pool.tokenOne.id,
      logoURI: logoMap[pool.tokenOne.symbol],
      symbol: pool.tokenOne.symbol,
    } as tokenCover;
    setCoverTokenIn(tokenOut, tokenIn);
    setCoverTokenOut(tokenIn, tokenOut);
    setCoverPoolFromVolatility(
      tokenIn,
      tokenOut,
      pool.volatilityTier.feeAmount.toString()
    );
    router.push({
      pathname: href,
      query: { state: "custom", tickSpacing: pool.tickSpacing },
    });
  };

  return (
    <>
      <div className="group relative cursor-pointer" onClick={chooseCoverPool}>
        <div className="grid md:grid-cols-2 items-center bg-black hover:bg-main1/40 transition-all px-4 py-3 rounded-[4px] border-grey/50 border">
          <div className="flex items-center md:gap-x-6 gap-x-3">
            <div className="flex items-center">
              <img
                className="w-[25px] h-[25px]"
                src={logoMap[pool.tokenZero.symbol]}
              />
              <img
                className="w-[25px] h-[25px] ml-[-8px]"
                src={logoMap[pool.tokenOne.symbol]}
              />
            </div>
            <span className="text-white text-xs flex items-center gap-x-1.5">
              {pool.tokenZero.symbol} - {pool.tokenOne.symbol}
            </span>
            <span className="bg-grey/50 rounded-[4px] text-grey1 text-xs px-3 py-0.5">
              {(Number(pool.volatilityTier.tickSpread) / 100) *
                (60 / Number(pool.volatilityTier.auctionLength))}
              %
            </span>
          </div>
          <div className="md:grid hidden grid-cols-3 w-full justify-end text-right items-center">
            <div className="text-white text-right text-xs">
            </div>
            <div className="text-right text-white text-xs">${formatUsdValue(pool.volumeUsd)}</div>
            <div className="text-right text-white text-xs">
              <span>${formatUsdValue(pool.tvlUsd)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
