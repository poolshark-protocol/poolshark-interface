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
  liquidity,
  feeTier,
  tickSpacing,
  unclaimedFees,
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
      const id = pool['data']['rangePools']['0']['id']
      setRangePoolRoute(id)
    } catch (error) {
      console.log(error)
    }
  }

  const { refetch: refetchRangePrice, data: priceRange } = useContractRead({
    address: rangePoolRoute,
    abi: rangePoolABI,
    functionName: 'poolState',
    args: [],
    chainId: 421613,
    watch: true,
    enabled: isConnected && rangePoolRoute != '',
    onSuccess(data) {
      console.log('Success price Range', data)
      setRangePrice(parseFloat(ethers.utils.formatUnits(data[5], 18)))
    },
    onError(error) {
      console.log('Error price Range', error)
    },
    onSettled(data, error) {
      console.log('Settled price Range', { data, error })
    },
  })

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
              ? ethers.utils.formatUnits(rangeTickPrice, 18)
              : 0,
            min: min,
            max: max,
            price: price,
            liquidity: liquidity,
            feeTier: feeTierPercentage,
            tickSpacing: tickSpacing,
            unclaimedFees: unclaimedFees,
          },
        }}
      >
        <div className="w-full cursor-pointer flex justify-between items-center bg-dark border border-grey2 rounded-xl py-3.5 pl-5 h-24 relative">
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
              <div className="bg-black px-2 py-1 rounded-lg text-grey">
                {feeTierPercentage}%
              </div>
            </div>
            <div className="text-sm flex items-center gap-x-3">
              <span>
                <span className="text-grey">Min:</span> {TickMath.getPriceStringAtTick(min)} {tokenZero.symbol}{' '}
                per {tokenOne.symbol}
              </span>
              <ArrowsRightLeftIcon className="w-4 text-grey" />
              <span>
                <span className="text-grey">Max:</span> {TickMath.getPriceStringAtTick(max)} {tokenOne.symbol}{' '}
                per {tokenZero.symbol}
              </span>
            </div>
          </div>{' '}
          {rangeTickPrice ? (
            Number(ethers.utils.formatUnits(rangeTickPrice, 18)) <
              Number(min) ||
            Number(ethers.utils.formatUnits(rangeTickPrice, 18)) >
              Number(max) ? (
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
            )
          ) : (
            <></>
          )}
        </div>
      </Link>
    </>
  )
}
