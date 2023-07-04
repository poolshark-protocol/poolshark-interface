import {
  ArrowsRightLeftIcon,
  ArrowLongRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react'
import { useCoverStore } from '../../hooks/useStore'
import Link from 'next/link'
import { getCoverPoolFromFactory, getRangePoolFromFactory } from '../../utils/queries'
import { useAccount, useContractRead } from 'wagmi'
import { coverPoolABI } from '../../abis/evm/coverPool'
import { ethers } from 'ethers'
import { TickMath } from '../../utils/math/tickMath'
import JSBI from 'jsbi'
import { ZERO, ZERO_ADDRESS } from '../../utils/math/constants'
import { tokenZeroAddress, tokenOneAddress } from '../../constants/contractAddresses'
import { getClaimTick } from '../../utils/maps'

export default function UserCoverPool({
  account,
  poolId,
  tokenZero,
  tokenOne,
  valueTokenZero,
  valueTokenOne,
  min,
  max,
  zeroForOne,
  userFillIn,
  userFillOut,
  epochLast,
  liquidity,
  lowerPrice,
  upperPrice,
  latestTick,
  tickSpacing,
  feeTier,
  href,
  prefill,
  close,
}) {
  const logoMap = {
    TOKEN20A: '/static/images/token.png',
    TOKEN20B: '/static/images/eth_icon.png',
    USDC: '/static/images/token.png',
    WETH: '/static/images/eth_icon.png',
    DAI: '/static/images/dai_icon.png',
    stkEth: '/static/images/eth_icon.png',
    pStake: '/static/images/eth_icon.png',
    UNI: '/static/images/dai_icon.png',
  }
  const feeTierPercentage = feeTier / 10000
  const [currentPool, resetPool, updatePool] = useCoverStore((state) => [
    state.pool,
    state.resetPool,
    state.updatePool,
  ])
  const [show, setShow] = useState(false)
  const [coverQuote, setCoverQuote] = useState(undefined)
  const [coverPoolRoute, setCoverPoolRoute] = useState('')
  const [claimPrice, setClaimPrice] = useState((zeroForOne ? upperPrice : lowerPrice))
  // fill percent is % of range crossed based on price
  const [fillPercent, setFillPercent] = useState((Math.abs((zeroForOne ? upperPrice : lowerPrice) - claimPrice)
                                                          / Math.abs(upperPrice - lowerPrice) * 100).toPrecision(3))

  const [claimTick, setClaimTick] = useState(zeroForOne ? max : min)

  useEffect(() => {
    getCoverPool()
  }, [tokenOne, tokenZero])

  useEffect(() => {
    updateClaimTick()
  }, [latestTick])

  useEffect(() => {
    setClaimPrice(!isNaN(claimTick) ? parseFloat(TickMath.getPriceStringAtTick(claimTick)) 
    : (zeroForOne ? upperPrice : lowerPrice))
  }, [claimTick])

  useEffect(() => {
    setFillPercent((Math.abs((zeroForOne ? upperPrice : lowerPrice) - claimPrice)
    / Math.abs(upperPrice - lowerPrice)).toPrecision(3))
  }, [claimPrice])

  const getCoverPool = async () => {
    try {
      var pool = tokenZero.id < tokenOne.id ?
                    await getCoverPoolFromFactory(tokenZero.id, tokenOne.id)
                  : await getCoverPoolFromFactory(tokenOne.id, tokenZero.id)
      let dataLength = pool['data']['coverPools'].length
      if(dataLength != 0) setCoverPoolRoute(pool['data']['coverPools']['0']['id'])
      else setCoverPoolRoute(ZERO_ADDRESS)
    } catch (error) {
      console.log(error)
    }
  }

  const updateClaimTick = async () => {
    const tick = await getClaimTick(
      poolId,
      min,
      max,
      zeroForOne,
      epochLast,
    )
    setClaimTick(tick)
  }

  const setPool = () => {
    resetPool
    /* updatePool({
      pool: poolId,
      tokenOne: tokenOne,
      tokenZero: tokenZero,
    }) */
  }
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
          coverPoolRoute: coverPoolRoute,
          min: min,
          max: max,
          claimTick: claimTick,
          userFillIn: userFillIn,
          userFillOut: userFillOut,
          liquidity: liquidity,
          latestTick: latestTick,
          tickSpacing: tickSpacing,
          epochLast: epochLast,
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
        className="w-full cursor-pointer grid grid-cols-5 md:grid-cols-7 items-center w-full bg-dark border border-grey2 rounded-xl py-3.5 sm:pl-5 pl-3 md:pr-0 md:pr-5 pr-3 min-h-24 relative">
        <div className="space-y-3 col-span-5">
          <div className="flex items-center gap-x-5">
            <div className="flex items-center ">
            <img className="md:w-[30px] md:h-[30px] w-[25px] h-[25px]" src={logoMap[tokenZero.symbol]} />
              <img
                className="md:w-[30px] md:h-[30px] w-[25px] h-[25px] ml-[-8px]"
                src={logoMap[tokenOne.symbol]}
              />
            </div>
            <div className="flex items-center gap-x-2 md:text-base text-sm">
                {tokenZero.symbol}
                <ArrowLongRightIcon className="w-5" />
                {tokenOne.symbol}
              </div>
            <div className="bg-black px-2 py-1 rounded-lg text-grey text-sm hidden md:block">
              {feeTierPercentage}%
            </div>
          </div>
          <div className="text-[10px] sm:text-xs grid grid-cols-5 items-center gap-x-3 md:pr-5">
            <span className="col-span-2">
              <span className="text-grey">Min:</span>
              {TickMath.getPriceStringAtTick(min)} {zeroForOne ? tokenOne.symbol : tokenZero.symbol} per{' '}
              {zeroForOne ? tokenZero.symbol : tokenOne.symbol}
            </span>
            <div className='flex items-center justify-center col-span-1'>
            <ArrowsRightLeftIcon className="w-4 text-grey" />
            </div>
            <span className="col-span-2">
              <span className="text-grey">Max:</span>
              {TickMath.getPriceStringAtTick(max)} {zeroForOne ? tokenOne.symbol : tokenZero.symbol} per{' '}
              {zeroForOne ? tokenZero.symbol : tokenOne.symbol}
            </span>
          </div>
        </div>
        <div className="md:col-span-2 flex gap-x-5 w-full flex-row-reverse md:flex-row items-center col-span-5 md:mx-5 mt-3 md:mt-0">
          <div className="bg-black  px-10 py-2 rounded-lg text-grey text-xs md:hidden block">
                {feeTierPercentage}%
              </div>
          
              <div className="flex relative bg-transparent items-center justify-center h-8 border-grey1 z-40 border rounded-lg gap-x-2 text-sm w-full">
            <div className={`bg-white h-full absolute left-0 z-0 rounded-l-[7px] opacity-10 w-[${parseInt(fillPercent)}%]`} />
            <div className="z-20 ">{fillPercent}% Filled</div>
          </div>
          </div>
      </div>
    </Link>
  )
}
