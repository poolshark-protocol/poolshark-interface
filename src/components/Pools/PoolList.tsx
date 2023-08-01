import { logoMap } from "../../utils/tokens";
import { useRangeStore } from "../../hooks/useRangeStore";
import { useCoverStore } from "../../hooks/useCoverStore";
import { useRouter } from "next/router";
import { token } from "../../utils/types";

export default function PoolList({
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
  const [
    setRangeTokenIn,
    setRangeTokenOut,
    setRangePoolAddress,
    setRangePoolData,
  ] = useRangeStore((state) => [
    state.setTokenIn,
    state.setTokenOut,
    state.setRangePoolAddress,
    state.setRangePoolData,
  ]);

  const [
    setCoverTokenIn,
    setCoverTokenOut,
    setCoverPoolAddress,
    setCoverPoolData,
    setVolatilityTier,
  ] = useCoverStore((state) => [
    state.setTokenIn,
    state.setTokenOut,
    state.setCoverPoolAddress,
    state.setCoverPoolData,
    state.setVolatilityTier,
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
    setRangePoolAddress(poolId);
    //setFeeTier(feeTier)
    router.push({
      pathname: href,
    });
  };

  const chooseCoverPool = () => {
    const tokenIn = {
      name: tokenZero.symbol,
      address: tokenZero.id,
      logoURI: logoMap[tokenZero.symbol],
      symbol: tokenZero.symbol,
    } as token;
    const tokenOut = {
      name: tokenOne.symbol,
      address: tokenOne.id,
      logoURI: logoMap[tokenOne.symbol],
      symbol: tokenOne.symbol,
    } as token;
    setCoverTokenIn(tokenOut, tokenIn);
    setCoverTokenOut(tokenIn, tokenOut);
    setCoverPoolAddress(poolId);
    setVolatilityTier({
      ...feeTier,
      id: feeTier.tickSpread == "20" ? 0 : 1,
    });
    router.push({
      pathname: href,
      query: { state: "existing" },
    });
  };

  return (
    <tr
      className="text-right cursor-pointer text-xs md:text-sm"
      onClick={href == "/cover" ? chooseCoverPool : chooseRangePool}
    >
      <td className="text-left flex items-center gap-x-2.5 md:gap-x-5 py-2.5">
        <div className="flex items-center ">
          <img
            className="md:w-[30px] md:h-[30px] w-[20px] h-[20px]"
            src={logoMap[tokenZero.symbol]}
          />
          <img
            className="md:w-[30px] md:h-[30px] w-[20px] h-[20px] ml-[-8px]"
            src={logoMap[tokenOne.symbol]}
          />
        </div>
        {tokenZero.symbol}-{tokenOne.symbol}
        <div className="pr-2 md:px-2 py-1 rounded-lg text-grey">
          {href == "/cover"
            ? feeTier.tickSpread == "20"
              ? "1.7"
              : "2.4"
            : "0.05"}
          %
        </div>
      </td>
      <td>${tvlUsd}m</td>
      <td className="hidden md:table-cell">${volumeUsd}m</td>
      <td>Ξ{volumeEth}</td>
    </tr>
  );
}
