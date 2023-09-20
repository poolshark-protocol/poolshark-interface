import { logoMap } from "../../utils/tokens";
import { useCoverStore } from "../../hooks/useCoverStore";
import { useRouter } from "next/router";
import { tokenCover } from "../../utils/types";

export default function CoverPool({
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

  const [setCoverTokenIn, setCoverTokenOut, setCoverPoolFromVolatility] =
  useCoverStore((state) => [
    state.setTokenIn,
    state.setTokenOut,
    state.setCoverPoolFromVolatility,
  ]);

const router = useRouter();

  const chooseCoverPool = () => {
    const tokenIn = {
      name: tokenZero.symbol,
      address: tokenZero.id,
      logoURI: logoMap[tokenZero.symbol],
      symbol: tokenZero.symbol,
    } as tokenCover;
    const tokenOut = {
      name: tokenOne.symbol,
      address: tokenOne.id,
      logoURI: logoMap[tokenOne.symbol],
      symbol: tokenOne.symbol,
    } as tokenCover;
    setCoverTokenIn(tokenOut, tokenIn);
    setCoverTokenOut(tokenIn, tokenOut);
    const vol0 = { id: 0 };
    const vol1 = { id: 1 };
    setCoverPoolFromVolatility(
      tokenIn,
      tokenOut,
      tickSpacing == "20" ? vol0 : vol1
    );
    router.push({
      pathname: href,
      query: { state: "existing", tickSpacing: tickSpacing },
    });
  };

  

  return (
    <>
      <div className="group relative cursor-pointer" onClick={chooseCoverPool}>
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
              {feeTier.tickSpread == "20" ? "1.7" : "2.4"}%
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
