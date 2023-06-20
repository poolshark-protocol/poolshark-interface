import {
  ArrowsRightLeftIcon,
  ArrowLongRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRangeStore } from '../../hooks/useStore'
import { getRangePoolFromFactory } from '../../utils/queries'
import { TickMath } from '../../utils/math/tickMath'
import JSBI from 'jsbi'
import { ethers } from 'ethers'
import { useAccount, useContractRead } from 'wagmi'
import { rangePoolABI } from '../../abis/evm/rangePool'
import {
  tokenOneAddress,
  tokenZeroAddress,
} from '../../constants/contractAddresses'
import { ZERO_ADDRESS } from '../../utils/math/constants'

export default function UserPool({
  account,
  poolId,
  tokenZero,
  valueTokenZero,
  tokenOne,
  valueTokenOne,
  min,
  max,
  price,
  userLiquidity,
  userTokenAmount,
  feeTier,
  tickSpacing,
  href,
  tvlUsd,
  volumeUsd,
  volumeEth,
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
  const [currentPool, resetPool, updatePool] = useRangeStore((state) => [
    state.pool,
    state.resetPool,
    state.updatePool,
  ])
  const [show, setShow] = useState(false)
  const [rangePrice, setRangePrice] = useState(undefined)
  const [rangeTickPrice, setRangeTickPrice] = useState(undefined)
  const [rangePoolRoute, setRangePoolRoute] = useState('')

  const { isConnected } = useAccount()

  //console.log('rangePoolRoute', rangePoolRoute)

  useEffect(() => {
    getRangePool()
  })

  useEffect(() => {
    setRangeParams()
  }, [rangePrice])

  const getRangePool = async () => {
    try {
      const pool = await getRangePoolFromFactory(
        tokenZeroAddress,
        tokenOneAddress,
      )
      const dataLength = pool['data']['rangePools'].length
      if (dataLength > 0) {
        const id = pool['data']['rangePools']['0']['id']
        const price = pool['data']['rangePools']['0']['price']
        const tickAtPrice = pool['data']['rangePools']['0']['tickAtPrice']
        setRangePoolRoute(id)
        setRangePrice(parseFloat(TickMath.getPriceStringAtSqrtPrice(price)))
        setRangeTickPrice(Number(tickAtPrice))
      }

    } catch (error) {
      console.log(error)
    }
  }

  function setRangeParams() {
    try {
      if (rangePrice) {
        const price = TickMath.getTickAtPriceString(rangePrice)
        setRangeTickPrice(ethers.utils.parseUnits(String(price), 0))
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
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
            rangePoolRoute: rangePoolRoute,
            rangeTickPrice: rangeTickPrice
              ? rangeTickPrice
              : 0,
            min: min,
            max: max,
            price: price,
            feeTier: feeTierPercentage,
            tickSpacing: tickSpacing,
            userLiquidity: userLiquidity,
            userTokenAmount: userTokenAmount
          },
        }}
      >
        <div className="w-full cursor-pointer grid grid-cols-7 items-center w-full bg-dark border border-grey2 rounded-xl py-3.5 pl-5 min-h-24 relative">
          <div className="space-y-3 col-span-5">
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
              <div className="flex items-center gap-x-2">
                {tokenZero.symbol}
                <div>-</div>
                {tokenOne.symbol}
              </div>
              <div className="bg-black px-2 py-1 rounded-lg text-grey">
                {feeTierPercentage}%
              </div>
            </div>
            <div className="text-xs grid grid-cols-5 items-center gap-x-3 pr-5">
              <span className='col-span-2'>
                <span className="text-grey">Min:</span> {TickMath.getPriceStringAtTick(min)} {tokenOne.symbol}{' '}
                per {tokenZero.symbol}
              </span>
              <div className='flex items-center justify-center col-span-1'>
              <ArrowsRightLeftIcon className="w-4 text-grey" />
              </div>
              <span className='col-span-2'>
                <span className="text-grey">Max:</span> {TickMath.getPriceStringAtTick(max)} {tokenOne.symbol}{' '}
                per {tokenZero.symbol}
              </span>
            </div>
          </div>{' '}
          <div className="col-span-2 mx-5">
          {rangeTickPrice ? (
            Number(rangeTickPrice) <
              Number(min) ||
            Number(rangeTickPrice) >=
              Number(max) ? (
                <div className="flex items-center justify-center bg-black py-2 px-5 rounded-lg gap-x-2 text-xs whitespace-nowrap">
                  <ExclamationTriangleIcon className="w-4 text-yellow-600" />
                  Out of Range
                </div>
            ) : (
              <div className="flex items-center bg-black justify-center py-2 px-5 rounded-lg gap-x-2 text-xs whitespace-nowrap">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  In Range
                </div>
            )
          ) : (
            <></>
          )}
          </div>
        </div>
      </Link>
    </>
  )
}
