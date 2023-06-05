import ConcentratedPool from '../../components/Pools/ConcentratedPool'
import Navbar from '../../components/Navbar'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { ArrowLongLeftIcon } from '@heroicons/react/20/solid'
import { token } from '../../utils/types'

export default function Concentrated() {
  const router = useRouter()

  const [poolId, setPoolId] = useState(router.query.poolId ?? '')
  const [tokenIn, setTokenIn] = useState({
    name: router.query.tokenZeroName,
    symbol: router.query.tokenZeroSymbol,
    logoURI: router.query.tokenZeroLogoURI,
    address: router.query.tokenZeroAddress,
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

  return (
    <div className="bg-[url('/static/images/background.svg')] bg-no-repeat bg-cover min-h-screen font-Satoshi ">
      <Navbar />
      <div className="flex justify-center w-full text-white">
        <div className="mt-[16vh] w-[55rem]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-x-6">
              <h1 className="text-3xl">Create Range Position</h1>
            </div>
            {/* <Link href="/pool"> */}
              <div className="bg-black border border-grey2 rounded-lg text-white px-7 py-[9px] cursor-pointer hover:opacity-80 flex gap-x-3" onClick={router.back}>
                <ArrowLongLeftIcon className="w-4 opacity-50 " />
                <h1 className="opacity-50">Back</h1>
              </div>
            {/* </Link> */}
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
            tickSpacingParam={tickSpacing}
            account={undefined}
          />
        </div>
      </div>
    </div>
  )
}
