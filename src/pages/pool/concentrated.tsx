import ConcentratedPool from '../../components/Pools/ConcentratedPool'
import Navbar from '../../components/Navbar'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Concentrated({
}) {
  const router = useRouter();
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
             account={'account'}
             key={router.query.poolId}
             poolId={router.query.poolId}
             tokenOneName={router.query.tokenOneName}
             tokenOneSymbol={router.query.tokenOneSymbol}
             tokenOneLogoURI={router.query.tokenOneLogoURI}
             tokenOneAddress={router.query.tokenOneAddress}
             tokenZeroName={router.query.tokenZeroName}
             tokenZeroSymbol={router.query.tokenZeroSymbol}
             tokenZeroLogoURI={router.query.tokenZeroLogoURI}
             tokenZeroAddress={router.query.tokenZeroAddress}
          />
        </div>
      </div>
    </div>
  )
}
