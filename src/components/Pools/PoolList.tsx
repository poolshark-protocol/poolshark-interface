import Link from 'next/link'

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
  const logoMap = {
    TOKEN20A: '/static/images/token.png',
    TOKEN20B: '/static/images/eth_icon.png',
    USDC: '/static/images/token.png',
    WETH: '/static/images/weth.png',
    DAI: '/static/images/dai_icon.png',
  }
  const feeTierPercentage = feeTier / 10000

  return (
    <Link
      href={{
        pathname: href,
        query: {
          account: account,
          poolId: poolId,
          tokenOneName: tokenOne.name,
          tokenOneSymbol: tokenOne.symbol,
          tokenOneLogoURI: logoMap[tokenOne.symbol],
          tokenOneAddress: tokenOne.id,
          tokenZeroName: tokenZero.name,
          tokenZeroSymbol: tokenZero.symbol,
          tokenZeroLogoURI: logoMap[tokenZero.symbol],
          tokenZeroAddress: tokenZero.id,
          auctionLenght: auctionLenght,
          feeTier: feeTierPercentage,
          tickSpacing: tickSpacing,
          state: href == '/cover' ? 'existing' : undefined,
        },
      }}
    >
      <tr className="text-right cursor-pointer text-xs md:text-sm">
        <td className="text-left flex items-center gap-x-2.5 md:gap-x-5 py-2.5">
          <div className="flex items-center ">
            <img className="md:w-[30px] md:h-[30px] w-[20px] h-[20px]" src={logoMap[tokenZero.symbol]} />
            <img
              className="md:w-[30px] md:h-[30px] w-[20px] h-[20px] ml-[-8px]"
              src={logoMap[tokenOne.symbol]}
            />
          </div>
          {tokenZero.symbol}-{tokenOne.symbol}
          <div className="pr-2 md:px-2 py-1 rounded-lg text-grey">{feeTierPercentage}%</div>
        </td>
        <td>${tvlUsd}m</td>
        <td className="hidden md:block">${volumeUsd}m</td>
        <td>Ξ{volumeEth}</td>
      </tr>
    </Link>
  )
}
