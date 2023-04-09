import DirectionalPool from '../../components/Pools/DirectionalPool'
import Navbar from '../../components/Navbar'

export default function Directional({
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
        <DirectionalPool
          key={poolId}
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
