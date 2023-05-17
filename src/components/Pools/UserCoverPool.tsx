import {
  ArrowsRightLeftIcon,
  ArrowLongRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react'
import { useCoverStore } from '../../hooks/useStore'
import Link from 'next/link'
import { getCoverPoolFromFactory } from '../../utils/queries'
import { useAccount, useContractRead } from 'wagmi'
import { coverPoolABI } from '../../abis/evm/coverPool'
import { ethers } from 'ethers'
import { TickMath } from '../../utils/math/tickMath'
import JSBI from 'jsbi'
import { ZERO_ADDRESS } from '../../utils/math/constants'

export default function UserCoverPool({
  account,
  poolId,
  tokenZero,
  tokenOne,
  valueTokenZero,
  valueTokenOne,
  min,
  max,
  epochLast,
  liquidity,
  latestTick,
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

  useEffect(() => {
    getCoverPool()
  }, [tokenOne, tokenZero])

  const { refetch: refetchcoverQuote, data: priceCover } = useContractRead({
    address: coverPoolRoute,
    abi: coverPoolABI,
    functionName:
      tokenOne.id != '' && tokenZero.id < tokenOne.id ? 'pool1' : 'pool0',
    args: [],
    chainId: 421613,
    watch: true,
    onSuccess(data) {
      //console.log('Success price Cover', data)
      setCoverQuote(parseFloat(ethers.utils.formatUnits(data[0], 18)))
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
      var pool = undefined
      if (tokenZero.id < tokenOne.id) {
        pool = await getCoverPoolFromFactory(tokenZero.id, tokenOne.id)
      } else {
        pool = await getCoverPoolFromFactory(tokenOne.id, tokenZero.id)
      }
      let id = ZERO_ADDRESS
      let dataLength = pool['data']['coverPools'].length
      if(dataLength != 0) id = pool['data']['coverPools']['0']['id']
      setCoverPoolRoute(id)
    } catch (error) {
      console.log(error)
    }
  }

  async function setCoverParams() {
    try {
      if (coverQuote != undefined) {
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
          tokenZeroLogoURI: logoMap[tokenZero.symbol],
          tokenZeroAddress: tokenZero.id,
          tokenZeroValue: valueTokenZero,
          tokenOneName: tokenOne.name,
          tokenOneSymbol: tokenOne.symbol,
          tokenOneLogoURI: logoMap[tokenOne.symbol],
          tokenOneAddress: tokenOne.id,
          tokenOneValue: valueTokenOne,
          coverPoolRoute: coverPoolRoute,
          coverTickPrice: coverTickPrice ? coverTickPrice : 0,
          min: min,
          max: max,
          liquidity: liquidity,
          latestTick: latestTick,
          epochLast: epochLast,
          feeTier: feeTierPercentage,
        },
      }}
    >
      <div
        onClick={() => setPool()}
        onMouseEnter={(e) => {
          setShow(true);
        }}
        onMouseLeave={(e) => {
          setShow(false);
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
              <span className="text-grey">Min:</span> {TickMath.getPriceStringAtTick(min)} {tokenZero.symbol}{" "}
              per {tokenOne.symbol}
            </span>
            <ArrowsRightLeftIcon className="w-4 text-grey" />
            <span>
              <span className="text-grey">Max:</span> {TickMath.getPriceStringAtTick(max)} {tokenOne.symbol}{" "}
              per {tokenZero.symbol}
            </span>
          </div>
        </div>
        <div className="pr-5">
              <div className="flex relative bg-transparent items-center justify-center h-8 border-grey1 z-40 border rounded-lg gap-x-2 text-sm w-36">
                <div className=" bg-white h-full absolute left-0 z-0 rounded-l-[7px] opacity-10 w-[40%]"/>
                <div className="z-20 ">
                40% Filled
                </div>
              </div>
            </div>
      </div>
    </Link>
  );
}
