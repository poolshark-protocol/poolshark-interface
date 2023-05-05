import {
  ArrowsRightLeftIcon,
  ArrowLongRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react'
import { useCoverStore } from '../../hooks/useStore'
import Link from 'next/link'
import { getCoverPoolFromFactory } from '../../utils/queries'
import { useContractRead } from 'wagmi'
import { coverPoolABI } from '../../abis/evm/coverPool'
import { ethers } from 'ethers'
import { TickMath } from '../../utils/tickMath'
import JSBI from 'jsbi'
import {
  tokenOneAddress,
  tokenZeroAddress,
} from '../../constants/contractAddresses'

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
  const feeTierPercentage = feeTier / 10000
  const [currentPool, resetPool, updatePool] = useCoverStore((state) => [
    state.pool,
    state.resetPool,
    state.updatePool,
  ])
  const [show, setShow] = useState(false)
  const [coverPrice, setCoverPrice] = useState(undefined)
  const [coverTickPrice, setCoverTickPrice] = useState(undefined)
  const [coverPoolRoute, setCoverPoolRoute] = useState('')

  //console.log('coverPrice', coverPrice)
  //console.log('coverTickPrice', coverTickPrice)

  useEffect(() => {
    getCoverPool()
  }, [tokenOne, tokenZero])

  const { refetch: refetchCoverPrice, data: priceCover } = useContractRead({
    address: coverPoolRoute,
    abi: coverPoolABI,
    functionName:
      tokenOne.id != '' && tokenZero.id < tokenOne.id ? 'pool1' : 'pool0',
    args: [],
    chainId: 421613,
    watch: true,
    onSuccess(data) {
      //console.log('Success price Cover', data)
      setCoverPrice(parseFloat(ethers.utils.formatUnits(data[0], 18)))
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
  }, [coverPrice])

  const getCoverPool = async () => {
    try {
      var pool = undefined
      if (tokenZero.id < tokenOne.id) {
        pool = await getCoverPoolFromFactory(tokenZero.id, tokenOne.id)
      } else {
        pool = await getCoverPoolFromFactory(tokenOne.id, tokenZero.id)
      }
      const id = pool['data']['coverPools']['0']['id']
      setCoverPoolRoute(id)
    } catch (error) {
      console.log(error)
    }
  }

  async function setCoverParams() {
    try {
      if (coverPrice != undefined) {
        const price = TickMath.getTickAtSqrtRatio(
          JSBI.divide(
            JSBI.multiply(
              JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96)),
              JSBI.BigInt(
                String(
                  Math.sqrt(Number(parseFloat(coverPrice).toFixed(30))).toFixed(
                    30,
                  ),
                )
                  .split('.')
                  .join(''),
              ),
            ),
            JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(30)),
          ),
        )
        //console.log('price', price)
        setCoverTickPrice(ethers.utils.parseUnits(String(price), 0))
      }
    } catch (error) {
      setCoverTickPrice(ethers.utils.parseUnits(String(coverPrice), 0))
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
          coverPrice: coverPrice ? coverPrice : 0,
          coverTickPrice: coverTickPrice ? coverTickPrice : 0,
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
        {coverTickPrice ? (
          Number(ethers.utils.formatUnits(coverTickPrice, 18)) < Number(min) ||
          Number(ethers.utils.formatUnits(coverTickPrice, 18)) > Number(max) ? (
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
  )
}
