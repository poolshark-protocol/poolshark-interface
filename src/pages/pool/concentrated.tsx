import ConcentratedPool from '../../components/Pools/ConcentratedPool'
import Navbar from '../../components/Navbar'
import Link from 'next/link'

export default function Concentrated({
  poolId,
  account,
  tokenOneName,
  tokenZeroName,
  tokenOneAddress,
  tokenZeroAddress,
}) {
  return (
    <div className="bg-[url('/static/images/background.svg')] bg-no-repeat bg-cover min-h-screen font-Satoshi ">
      <Navbar />
      <div className="flex justify-center w-full text-white">
        <div className="mt-[16vh] w-[55rem]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-x-6">
              <h1 className="text-3xl">Create Pool</h1>
            </div>
            <Link href="/pool">
              <span className="bg-black border border-grey2 rounded-lg text-white px-7 py-[9px] cursor-pointer hover:opacity-80">
                Cancel
              </span>
            </Link>
          </div>
          <ConcentratedPool
            account={'0x0000'}
            poolId={poolId}
            tokenOneName={tokenOneName}
            tokenOneAddress={tokenOneAddress}
            tokenZeroName={tokenZeroName}
            tokenZeroAddress={tokenZeroAddress}
          />
        </div>
      </div>
    </div>
  )
}
