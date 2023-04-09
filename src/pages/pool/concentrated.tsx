import ConcentratedPool from '../../components/Pools/ConcentratedPool'
import Navbar from '../../components/Navbar'

export default function Concentrated({
  poolId,
  account,
  tokenOneName,
  tokenZeroName,
  tokenOneAddress,
  tokenZeroAddress,
}) {
  return (
    <div className="bg-[url('/static/images/background.svg')] bg-no-repeat bg-cover min-h-screen font-Satoshi">
      <Navbar />
      <div className="flex justify-center w-full text-white">
        <ConcentratedPool
          poolId={poolId}
          account={account}
          tokenOneName={tokenOneName}
          tokenOneAddress={tokenOneAddress}
          tokenZeroName={tokenZeroName}
          tokenZeroAddress={tokenZeroAddress}
        />
      </div>
    </div>
  )
}
