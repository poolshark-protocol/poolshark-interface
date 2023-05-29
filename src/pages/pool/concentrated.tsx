import ConcentratedPool from '../../components/Pools/ConcentratedPool'
import Navbar from '../../components/Navbar'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { ArrowLongLeftIcon } from '@heroicons/react/20/solid'

export default function Concentrated() {
  type token = {
    name: string
    symbol: string
    logoURI: string
    address: string
  }
  const router = useRouter()

  /* useEffect(() => {
    if (router.isReady) {
      const query = router.query
      setPoolId(query.poolId)
      setTokenIn({
        name: query.tokenZeroName,
        symbol: query.tokenZeroSymbol,
        logoURI: query.tokenZeroLogoURI,
        address: query.tokenZeroAddress,
        value: query.tokenZeroValue,
      } as token)
      setTokenOut({
        name: query.tokenOneName,
        symbol: query.tokenOneSymbol,
        logoURI: query.tokenOneLogoURI,
        address: query.tokenOneAddress,
        value: query.tokenOneValue,
      } as token)
      setLiquidity(query.liquidity)
      setFeeTier(query.feeTier)
      setMinLimit(query.min)
      setMaxLimit(query.max)
    }
  }, [router.isReady]) */

  const [poolId, setPoolId] = useState(router.query.poolId ?? '')
  const [tokenIn, setTokenIn] = useState({
    name: router.query.tokenZeroName ?? '',
    symbol: router.query.tokenZeroSymbol ?? '',
    logoURI: router.query.tokenZeroLogoURI ?? '',
    address: router.query.tokenZeroAddress ?? '',
  } as token)
  const [tokenOut, setTokenOut] = useState({
    name: router.query.tokenOneName,
    symbol: router.query.tokenOneSymbol,
    logoURI: router.query.tokenOneLogoURI,
    address: router.query.tokenOneAddress,
  } as token)
  const [liquidity, setLiquidity] = useState(router.query.liquidity ?? '0')
  const [tickSpacing, setTickSpacing] = useState(router.query.tickSpacing ?? 10)
  const [feeTier, setFeeTier] = useState(router.query.feeTier ?? '')
  const [minLimit, setMinLimit] = useState(router.query.min ?? '0')
  const [maxLimit, setMaxLimit] = useState(router.query.max ?? '0')

  /*  const [is0Copied, setIs0Copied] = useState(false)
  const [is1Copied, setIs1Copied] = useState(false)
  const [isPoolCopied, setIsPoolCopied] = useState(false)
  const [tokenZeroDisplay, setTokenZeroDisplay] = useState(
    tokenIn.address.toString().substring(0, 6) +
      '...' +
      tokenIn.address
        .toString()
        .substring(
          tokenIn.address.toString().length - 4,
          tokenIn.address.toString().length,
        ),
  )
  const [tokenOneDisplay, setTokenOneDisplay] = useState(
    tokenOut.address.toString().substring(0, 6) +
      '...' +
      tokenOut.address
        .toString()
        .substring(
          tokenOut.address.toString().length - 4,
          tokenOut.address.toString().length,
        ),
  )
  const [poolDisplay, setPoolDisplay] = useState(
    poolId.toString().substring(0, 6) +
      '...' +
      poolId
        .toString()
        .substring(poolId.toString().length - 4, poolId.toString().length),
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
    navigator.clipboard.writeText(tokenIn.address.toString())
    setIs0Copied(true)
  }

  function copyAddress1() {
    navigator.clipboard.writeText(tokenOut.address.toString())
    setIs1Copied(true)
  }

  function copyPoolAddress() {
    navigator.clipboard.writeText(poolId.toString())
    setIsPoolCopied(true)
  } */

  console.log('Concentrated Pool', {
    poolId,
    tokenIn,
    tokenOut,
    liquidity,
    feeTier,
    minLimit,
    maxLimit,
    tickSpacing
  })

  return (
    <div className="bg-[url('/static/images/background.svg')] bg-no-repeat bg-cover min-h-screen font-Satoshi ">
      <Navbar />
      <div className="flex justify-center w-full text-white">
        <div className="mt-[16vh] w-[55rem]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-x-6">
              <h1 className="text-3xl">Create Range Position</h1>
            </div>
            <Link href="/pool">
              <span className="bg-black border border-grey2 rounded-lg text-white px-7 py-[9px] cursor-pointer hover:opacity-80 flex gap-x-3">
                <ArrowLongLeftIcon className="w-4 opacity-50 " />
                <h1 className="opacity-50">Back</h1>
              </span>
            </Link>
          </div>
          <ConcentratedPool
            key={poolId + 'pool'}
            poolId={poolId}
            tokenOneName={tokenOut.name}
            tokenOneSymbol={tokenOut.symbol}
            tokenOneLogoURI={tokenOut.logoURI}
            tokenOneAddress={tokenOut.address}
            tokenZeroName={tokenIn.name}
            tokenZeroSymbol={tokenIn.symbol}
            tokenZeroLogoURI={tokenIn.logoURI}
            tokenZeroAddress={tokenIn.address}
            minLimit={minLimit}
            maxLimit={maxLimit}
            liquidity={liquidity}
            feeTier={feeTier}
            account={undefined}
          />
        </div>
      </div>
    </div>
  )
}
