import Link from 'next/link'
export default function PoolList({
  poolId,
  tokenOneName,
  tokenZeroName,
  tokenOneAddress,
  tokenZeroAddress,
  tvlUsd,
  volumeUsd,
  volumeEth,
  href,
}) {
  return (
    <Link
      href={{
        pathname: href,
        query: {
          poolId: poolId,
          tokenOneName: tokenOneName,
          tokenOneAddress: tokenOneAddress,
          tokenZeroName: tokenZeroName,
          tokenZeroAddress: tokenZeroAddress,
          tvlUsd: tvlUsd,
          volumeUsd: volumeUsd,
          volumeEth: volumeEth,
        },
      }}
    >
      <tr className="text-right">
        <td className="text-left flex items-center gap-x-5 py-2.5">
          <div className="flex items-center ">
            <img height="30" width="30" src="/static/images/token.png" />
            <img
              height="30"
              width="30"
              className="ml-[-8px]"
              src="/static/images/token.png"
            />
          </div>
          {tokenOneName}-{tokenZeroName}
        </td>
        <td>${tvlUsd}m</td>
        <td>${volumeUsd}m</td>
        <td>${volumeEth}m</td>
      </tr>
    </Link>
  )
}
