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
  const [coverTickPrice, setCoverTickPrice] = useState(undefined)
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
    / Math.abs(upperPrice - lowerPrice) * 100).toPrecision(3))
  }, [claimPrice])

  const { isConnected } = useAccount()

  const { refetch: refetchcoverQuote, data: priceCover } = useContractRead({
    address: coverPoolRoute,
    abi: coverPoolABI,
    functionName:
      tokenOne.id != '' && tokenZero.id < tokenOne.id ? 'pool1' : 'pool0',
    args: [],
    chainId: 421613,
    watch: true,
    enabled: isConnected && coverPoolRoute != '',
    onSuccess(data) {
      //console.log('Success price Cover', data)
      setCoverQuote(TickMath.getPriceStringAtSqrtPrice(data[0]))
    },
    onError(error) {
      console.log('Error price Cover', error)
    },
    onSettled(data, error) {
      //console.log('Settled price Cover', { data, error })
    },
  })

  useEffect(() => {
    setCoverParams()
  }, [coverQuote])

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

  async function setCoverParams() {
    try {
      if (coverQuote != undefined) {
        console.log('cover quote check', coverQuote)
        const price = TickMath.getTickAtPriceString(coverQuote)
        setCoverTickPrice(ethers.utils.parseUnits(String(price), 0))
      }
    } catch (error) {
      setCoverTickPrice(ethers.utils.parseUnits(String(coverQuote), 0))
      console.log(error)
    }
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
          tokenZeroLogoURI: zeroForOne
            ? logoMap[tokenOne.symbol]
            : logoMap[tokenZero.symbol],
          tokenZeroAddress: tokenZero.id,
          tokenZeroValue: valueTokenZero,
          tokenOneName: tokenOne.name,
          tokenOneSymbol: tokenOne.symbol,
          tokenOneLogoURI: zeroForOne
            ? logoMap[tokenZero.symbol]
            : logoMap[tokenOne.symbol],
          tokenOneAddress: tokenOne.id,
          tokenOneValue: valueTokenOne,
          coverPoolRoute: coverPoolRoute,
          coverTickPrice: coverTickPrice ? coverTickPrice : 0,
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
            <div className="bg-black px-2 py-1 rounded-lg text-grey">
              {feeTierPercentage}%
            </div>
          </div>
          <div className="text-sm flex items-center gap-x-3">
            <span>
              <span className="text-grey">Min:</span>{' '}
              {TickMath.getPriceStringAtTick(min)} {tokenZero.symbol} per{' '}
              {tokenOne.symbol}
            </span>
            <ArrowsRightLeftIcon className="w-4 text-grey" />
            <span>
              <span className="text-grey">Max:</span>{' '}
              {TickMath.getPriceStringAtTick(max)} {tokenOne.symbol} per{' '}
              {tokenZero.symbol}
            </span>
          </div>
        </div>
        <div className="pr-5">
          <div className="flex relative bg-transparent items-center justify-center h-8 border-grey1 z-40 border rounded-lg gap-x-2 text-sm w-36">
            <div className={`bg-white h-full absolute left-0 z-0 rounded-l-[7px] opacity-10 w-[${fillPercent}%]`} />
            <div className="z-20 ">{fillPercent}% Filled</div>
          </div>
        </div>
      </div>
    </Link>
  )
}
