import DirectionalPool from '../../components/Pools/DirectionalPool'
import Navbar from '../../components/Navbar'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default async function Directional() {
  const router = useRouter()
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
          <DirectionalPool
            account={'account'}
            key={
              router.query.poolId === undefined
                ? ''
                : router.query.poolId.toString()
            }
            poolId={
              router.query.poolId === undefined
                ? ''
                : router.query.poolId.toString()
            }
            tokenOneName={
              router.query.tokenOneName === undefined
                ? ''
                : router.query.tokenOneName.toString()
            }
            tokenOneSymbol={
              router.query.tokenOneSymbol === undefined
                ? ''
                : router.query.tokenOneSymbol.toString()
            }
            tokenOneLogoURI={
              router.query.tokenOneLogoURI === undefined
                ? ''
                : router.query.tokenOneLogoURI.toString()
            }
            tokenOneAddress={
              router.query.tokenOneAddress === undefined
                ? ''
                : router.query.tokenOneAddress.toString()
            }
            tokenZeroName={
              router.query.tokenZeroName === undefined
                ? ''
                : router.query.tokenZeroName.toString()
            }
            tokenZeroSymbol={
              router.query.tokenZeroSymbol === undefined
                ? ''
                : router.query.tokenZeroSymbol.toString()
            }
            tokenZeroLogoURI={
              router.query.tokenZeroLogoURI === undefined
                ? ''
                : router.query.tokenZeroLogoURI.toString()
            }
            tokenZeroAddress={
              router.query.tokenZeroAddress === undefined
                ? ''
                : router.query.tokenZeroAddress.toString()
            }
          />
        </div>
      </div>
    </div>
  )
}
