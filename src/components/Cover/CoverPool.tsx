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

  console.log('fee tier', feeTier)


  const volTierMap = new Map<string, any>([
    ['1000', { id: 0, volatility: "1" }],
    ['3000', { id: 1, volatility: "3" }],
    ['10000', { id: 2, volatility: "24" }]
  ]);
  console.log('fee amount', feeTier.feeAmount)
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
      volTierMap.get(feeTier.feeAmount.toString()).id
    );
    router.push({
      pathname: href,
      query: { state: "existing", tickSpacing: tickSpacing },
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
              {volTierMap.get(feeTier.feeAmount.toString()).volatility}%
            </span>
          </div>
          <div className="md:grid hidden grid-cols-3 w-full justify-end text-right items-center">
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
