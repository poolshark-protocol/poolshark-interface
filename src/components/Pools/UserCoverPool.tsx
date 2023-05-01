import {
  ArrowsRightLeftIcon,
  ArrowLongRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react'
import { useCoverStore } from '../../hooks/useStore'
import Link from 'next/link'

export default function UserCoverPool({
  account,
  poolId,
  tokenZero,
  tokenOne,
  valueTokenZero,
  valueTokenOne,
  min,
  max,
  liquidity,
  feeTier,
  href,
  prefill,
  close,
}) {
  const logoMap = {
    TOKEN20A: '/static/images/eth_icon.png',
    TOKEN20B: '/static/images/token.png',
    USDC: '/static/images/token.png',
    WETH: '/static/images/eth_icon.png',
    DAI: '/static/images/dai_icon.png',
    stkEth: '/static/images/eth_icon.png',
    pStake: '/static/images/eth_icon.png',
    UNI: '/static/images/dai_icon.png',
  }
  const [show, setShow] = useState(false)
  const [currentPool, resetPool, updatePool] = useCoverStore((state) => [
    state.pool,
    state.resetPool,
    state.updatePool,
  ])

  const feeTierPercentage = feeTier / 10000

  const setPool = () => {
    resetPool
    /* updatePool({
      pool: poolId,
      tokenOne: tokenOne,
      tokenZero: tokenZero,
    }) */
    //prefill('existingPool')
    //close(false)
    // console.log(currentPool)
  }

  // useEffect(() => {
  //   console.log(
  //   tokenOne.name,
  //  tokenZero,
  //   tokenOne.id,
  //   tokenZero.id,
  //   poolId,)
  // },[])
  return (
    <Link
      href={{
        pathname: href,
        query: {
          account: account,
          poolId: poolId,
          tokenZeroName: tokenZero.name,
          tokenZeroSymbol: tokenZero.symbol,
          tokenZeroLogoURI: logoMap[tokenZero.symbol],
          tokenZeroAddress: tokenZero.id,
          tokenZeroValue: valueTokenZero,
          tokenOneName: tokenOne.name,
          tokenOneSymbol: tokenOne.symbol,
          tokenOneLogoURI: logoMap[tokenOne.symbol],
          tokenOneAddress: tokenOne.id,
          tokenOneValue: valueTokenOne,
          min: min,
          max: max,
          liquidity: liquidity,
          feeTier: feeTierPercentage,
        },
      }}
    >
      <div
        onClick={() => setPool()}
        onMouseEnter={(e) => {
          setShow(true)
        }}
        onMouseLeave={(e) => {
          setShow(false)
        }}
        className="w-full cursor-pointer flex justify-between items-center bg-dark border border-grey2 rounded-xl py-3.5 pl-5 h-24 relative"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-x-5">
            <div className="flex items-center ">
              <img height="30" width="30" src={logoMap[tokenZero.symbol]} />
              <img
                height="30"
                width="30"
                className="ml-[-8px]"
                src={logoMap[tokenOne.symbol]}
              />
            </div>
            <div className="flex gap-x-2">
              {tokenZero.name}
              <ArrowLongRightIcon className="w-5" />
              {tokenOne.name}
            </div>
          </div>
          <div className="text-sm flex items-center gap-x-3">
            <span>
              <span className="text-grey">Min:</span> {min} {tokenZero.symbol}{' '}
              per {tokenOne.symbol}
            </span>
            <ArrowsRightLeftIcon className="w-4 text-grey" />
            <span>
              <span className="text-grey">Max:</span> {max} {tokenOne.symbol}{' '}
              per {tokenZero.symbol}
            </span>
          </div>
        </div>
        {valueTokenZero == 0 || valueTokenOne == 0 ? (
          <div className="pr-5">
            <div className="flex items-center bg-black py-2 px-5 rounded-lg gap-x-2 text-sm">
              <ExclamationTriangleIcon className="w-4 text-yellow-600" />
              Out of Range
            </div>
          </div>
        ) : (
          <div className="pr-5">
            <div className="flex items-center bg-black py-2 px-5 rounded-lg gap-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              In Range
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
