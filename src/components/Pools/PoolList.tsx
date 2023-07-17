import { logoMap } from "../../utils/tokens";
import { useRangeStore } from "../../hooks/useRangeStore";
import { useRouter } from "next/router";

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

  const router = useRouter();

  const feeTierPercentage = feeTier / 10000;

  const chooseRangePool = () => {
    console.log("chooseRangePool");
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
    setRangePoolData({
      liquidity: liquidity,
      feeTier: feeTier,
      auctionLenght: auctionLenght,
      tickSpacing: tickSpacing,
    });
    router.push({
      pathname: href,
    });
  };

  const chooseCoverPool = () => {
    //TODO@retraca
    console.log("chooseCoverPool");
    router.push({
      pathname: href,
    });
  };

  return (
    <div onClick={href == "/cover" ? chooseCoverPool : chooseRangePool}>
      <tr className="text-right cursor-pointer text-xs md:text-sm">
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
            {feeTierPercentage}%
          </div>
        </td>
        <td>${tvlUsd}m</td>
        <td className="hidden md:table-cell">${volumeUsd}m</td>
        <td>Ξ{volumeEth}</td>
      </tr>
    </div>
  );
}
