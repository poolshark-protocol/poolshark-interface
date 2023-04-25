import DirectionalPool from '../../components/Pools/DirectionalPool'
import Navbar from '../../components/Navbar'
import Link from 'next/link'
import { useRouter } from 'next/router'
import CoverExistingPool from '../../components/Cover/CoverExistingPool'
import { useEffect, useState } from 'react'

export default function Directional() {
  const router = useRouter()
  const zeroAddress =
    router.query.tokenZeroAddress === undefined
      ? ''
      : router.query.tokenZeroAddress.toString()
  const oneAddress =
    router.query.tokenOneAddress === undefined
      ? ''
      : router.query.tokenOneAddress.toString()
  const poolAddress =
    router.query.poolId === undefined ? '' : router.query.poolId.toString()

  const [is0Copied, setIs0Copied] = useState(false)
  const [is1Copied, setIs1Copied] = useState(false)
  const [isPoolCopied, setIsPoolCopied] = useState(false)
  const [tokenZeroDisplay, setTokenZeroDisplay] = useState(
    zeroAddress.substring(0, 6) +
      '...' +
      zeroAddress.substring(zeroAddress.length - 4, zeroAddress.length),
  )
  const [tokenOneDisplay, setTokenOneDisplay] = useState(
    oneAddress.substring(0, 6) +
      '...' +
      oneAddress.substring(oneAddress.length - 4, oneAddress.length),
  )
  const [poolDisplay, setPoolDisplay] = useState(
    poolAddress.substring(0, 6) +
      '...' +
      poolAddress.substring(poolAddress.length - 4, poolAddress.length),
  )

  useEffect(() => {
    if (copyAddress0) {
      const timer = setTimeout(() => {
        setIs0Copied(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  })

  useEffect(() => {
    if (copyAddress1) {
      const timer = setTimeout(() => {
        setIs1Copied(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  })

  useEffect(() => {
    if (copyPoolAddress) {
      const timer = setTimeout(() => {
        setIsPoolCopied(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  })

  function copyAddress0() {
    navigator.clipboard.writeText(
      router.query.tokenZeroAddress === undefined
        ? ''
        : router.query.tokenZeroAddress.toString(),
    )
    setIs0Copied(true)
  }

  function copyAddress1() {
    navigator.clipboard.writeText(
      router.query.tokenOneAddress === undefined
        ? ''
        : router.query.tokenOneAddress.toString(),
    )
    setIs1Copied(true)
  }

  function copyPoolAddress() {
    navigator.clipboard.writeText(
      router.query.poolId === undefined ? '' : router.query.poolId.toString(),
    )
    setIsPoolCopied(true)
  }
  return (
    <div className="bg-[url('/static/images/background.svg')] bg-no-repeat bg-cover min-h-screen font-Satoshi ">
      <Navbar />
      <div className="flex justify-center w-full text-white">
        <div className="mt-[16vh] w-[55rem]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-x-6">
              <h1 className="text-3xl">Create Cover Pool</h1>
            </div>
            <Link href="/pool">
              <span className="bg-black border border-grey2 rounded-lg text-white px-7 py-[9px] cursor-pointer hover:opacity-80">
                Cancel
              </span>
            </Link>
          </div>
          <div className="mb-6">
            <div className="flex justify-between text-[#646464]">
              <div className="grid grid-cols-2 gap-x-10 pl-2 ">
                <h1
                  onClick={() => copyAddress0()}
                  className="text-xs cursor-pointer w-32"
                >
                  {router.query.tokenZeroName}:
                  {is0Copied ? (
                    <span className="ml-1">Copied</span>
                  ) : (
                    <span className="ml-1">{tokenZeroDisplay}</span>
                  )}
                </h1>
                <h1
                  onClick={() => copyAddress1()}
                  className="text-xs cursor-pointer"
                >
                  {router.query.tokenOneName}:
                  {is1Copied ? (
                    <span className="ml-1">Copied</span>
                  ) : (
                    <span className="ml-1">{tokenOneDisplay}</span>
                  )}
                </h1>
              </div>
              <h1
                onClick={() => copyPoolAddress()}
                className="text-xs cursor-pointer flex items-center"
              >
                Pool:
                {isPoolCopied ? (
                  <span className="ml-1">Copied</span>
                ) : (
                  <span className="ml-1">{poolDisplay}</span>
                )}
              </h1>
            </div>
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
