import { useCoverStore } from "../../hooks/useCoverStore";
import { useRouter } from "next/router";
import { tokenCover } from "../../utils/types";
import { formatUsdValue } from "../../utils/math/valueMath";
import { TickMath } from "../../utils/math/tickMath";
import { useConfigStore } from "../../hooks/useConfigStore";
import { useShallow } from "zustand/react/shallow";

export default function CoverPool({ pool, href }) {
  const [coverSubgraph, logoMap] = useConfigStore(
    useShallow((state) => [state.coverSubgraph, state.logoMap]),
  );

  const [setCoverTokenIn, setCoverTokenOut, setCoverPoolFromVolatility] =
    useCoverStore(
      useShallow((state) => [
        state.setTokenIn,
        state.setTokenOut,
        state.setCoverPoolFromVolatility,
      ]),
    );

  const router = useRouter();

  const chooseCoverPool = () => {
    const tokenIn = {
      name: pool.tokenZero.symbol,
      address: pool.tokenZero.id,
      logoURI: logoMap[pool.tokenZero.id],
      symbol: pool.tokenZero.symbol,
      decimals: pool.tokenZero.decimals,
      coverUSDPrice: pool.tokenZero.usdPrice,
    } as tokenCover;
    const tokenOut = {
      name: pool.tokenOne.symbol,
      address: pool.tokenOne.id,
      logoURI: logoMap[pool.tokenOne.id],
      symbol: pool.tokenOne.symbol,
      decimals: pool.tokenOne.decimals,
      coverUSDPrice: pool.tokenOne.usdPrice,
    } as tokenCover;
    setCoverTokenIn(tokenOut, tokenIn, "0", true);
    setCoverTokenOut(tokenIn, tokenOut, "0", false);
    setCoverPoolFromVolatility(
      tokenIn,
      tokenOut,
      pool.volatilityTier.feeAmount.toString(),
      coverSubgraph,
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
                src={logoMap[pool.tokenZero.id]}
              />
              <img
                className="w-[25px] h-[25px] ml-[-8px]"
                src={logoMap[pool.tokenOne.id]}
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
            <div className="text-white text-right text-xs"></div>
            <div className="text-right text-white text-xs">
              ${formatUsdValue(pool.volumeUsd)}
            </div>
            <div className="text-right text-white text-xs">
              <span>${formatUsdValue(pool.tvlUsd)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
