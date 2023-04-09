import ConcentratedPool from '../../components/Pools/ConcentratedPool'
import Navbar from '../../components/Navbar'

export default function Concentrated({
  poolId,
  tokenOneName,
  tokenZeroName,
  tokenOneAddress,
  tokenZeroAddress,
  tvlUsd,
  volumeUsd,
  volumeEth,
}) {
  return (
    <div className="bg-[url('/static/images/background.svg')] bg-no-repeat bg-cover min-h-screen font-Satoshi">
      <Navbar />
      <div className="flex justify-center w-full text-white">
        <ConcentratedPool
          poolId={poolId}
          tokenOneName={tokenOneName}
          tokenOneAddress={tokenOneAddress}
          tokenZeroName={tokenZeroName}
          tokenZeroAddress={tokenZeroAddress}
          tvlUsd={tvlUsd}
          volumeUsd={volumeUsd}
          volumeEth={volumeEth}
        />
      </div>
    </div>
  )
}
