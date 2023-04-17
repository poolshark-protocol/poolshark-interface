import Link from 'next/link'
export default function PoolList({
  poolId,
  account,
  tokenOne,
  tokenZero,
  tvlUsd,
  volumeUsd,
  volumeEth,
  href,
}) {
  const logoMap = {
    TOKEN20A: '/static/images/eth_icon.png',
    TOKEN20B: '/static/images/token.png',
    USDC: '/static/images/token.png',
    WETH: '/static/images/weth.png',
    DAI: '/static/images/dai_icon.png',
  }

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
        },
      }}
    >
      <tr className="text-right cursor-pointer">
        <td className="text-left flex items-center gap-x-5 py-2.5">
          <div className="flex items-center ">
            <img height="30" width="30" src={logoMap[tokenZero.symbol]} />
            <img
              height="30"
              width="30"
              className="ml-[-8px]"
              src={logoMap[tokenOne.symbol]}
            />
          </div>
          {tokenZero.name}-{tokenOne.name}
        </td>
        <td>${tvlUsd}m</td>
        <td>${volumeUsd}m</td>
        <td>${volumeEth}m</td>
      </tr>
    </Link>
  )
}
