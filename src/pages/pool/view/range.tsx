import Navbar from '../../../components/Navbar'
import {
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/20/solid'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import RangeCollectButton from '../../../components/Buttons/RangeCollectButton'
import RangeBurnButton from '../../../components/Buttons/RangeBurnButton'
import RangeCompoundButton from '../../../components/Buttons/RangeCompoundButton'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { BigNumber, ethers } from 'ethers'
import { TickMath } from '../../../utils/math/tickMath'
import JSBI from 'jsbi'
import { getRangePoolFromFactory } from '../../../utils/queries'

export default function Range() {
  type token = {
    name: string
    symbol: string
    logoURI: string
    address: string
    value: string
  }
  const { address } = useAccount()
  const router = useRouter()

  const [poolAddress, setPoolAddress] = useState(router.query.poolId ?? '')
  const [tokenIn, setTokenIn] = useState({
    name: router.query.tokenZeroAddress ?? '',
    symbol: router.query.tokenZeroSymbol ?? '',
    logoURI: router.query.tokenZeroLogoURI ?? '',
    address: router.query.tokenZeroAddress ?? '',
    value: router.query.tokenZeroValue ?? '',
  } as token)
  const [tokenOut, setTokenOut] = useState({
    name: router.query.tokenOneName ?? '',
    symbol: router.query.tokenOneSymbol ?? '',
    logoURI: router.query.tokenOneLogoURI ?? '',
    address: router.query.tokenOneAddress ?? '',
    value: router.query.tokenOneValue ?? '',
  } as token)
  const [tokenOrder, setTokenOrder] = useState(router.query.tokenOneAddress && 
                                               router.query.tokenZeroAddress ? String(router.query.tokenOneAddress).localeCompare(
                                                                                  String(router.query.tokenOneAddress)
                                                                               ) < 0
                                                : true)

                                                price0
  const [feeTier, setFeeTier] = useState(router.query.feeTier ?? '')
  const [tickSpacing, setTickSpacing] = useState(router.query.tickSpacing ?? 10)
  const [userLiquidity, setUserLiquidity] = useState(router.query.userLiquidity ?? 0)
  const [userLiquidityUsd, setUserLiquidityUsd] = useState(0)
  const [minLimit, setMinLimit] = useState(router.query.min ?? '0')
  const [maxLimit, setMaxLimit] = useState(router.quern.max ?? '0')
  const [rangePrice, setPoolPrice] = useState(router.query.price ?? '0')
  const [amount0, setAmount0] = useState(0)
  const [amount1, setAmount1] = useState(0)
  const [amount0Usd, setAmount0Usd] = useState(0)
  const [amount1Usd, setAmount1Usd] = useState(0)
  const [rangePoolRoute, setRangePoolRoute] = useState(
    router.query.rangePoolRoute ?? '0',
  )
  const [rangeTickPrice, setRangeTickPrice] = useState(
    router.query.rangeTickPrice ?? 0,
  )
  const [mktRate, setMktRate] = useState({})

  useEffect(() => {
    if (router.isReady) {
      const query = router.query
      setPoolAddress(query.poolId)
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
      setTokenOrder(String(query.tokenOneAddress).localeCompare(
                      String(query.tokenOneAddress)) < 0)
      // setLiquidity(query.userLiquidity)
      setFeeTier(query.feeTier)
      setTickSpacing(query.tickSpacing)
      setMinLimit(query.min)
      setMaxLimit(query.max)
      setPoolPrice(query.price)
      setTokenZeroDisplay(
        query.tokenZeroAddress.toString().substring(0, 6) +
          '...' +
          query.tokenZeroAddress

            .toString()
            .substring(
              query.tokenZeroAddress.toString().length - 4,
              query.tokenZeroAddress.toString().length,
            ),
      )
      setTokenOneDisplay(
        query.tokenOneAddress.toString().substring(0, 6) +
          '...' +
          query.tokenOneAddress

            .toString()
            .substring(
              query.tokenOneAddress.toString().length - 4,
              query.tokenOneAddress.toString().length,
            ),
      )
      setPoolDisplay(
        query.poolId.toString().substring(0, 6) +
          '...' +
          query.poolId

            .toString()
            .substring(
              query.poolId.toString().length - 4,
              query.poolId.toString().length,
            ),
      )
      setRangePoolRoute(query.rangePoolRoute)
      console.log('range tick price', query.rangeTickPrice)
      setRangeTickPrice(query.rangeTickPrice)
    }
  }, [router.isReady])



  //Pool Addresses
  const [is0Copied, setIs0Copied] = useState(false)
  const [is1Copied, setIs1Copied] = useState(false)
  const [isPoolCopied, setIsPoolCopied] = useState(false)
  const [tokenZeroDisplay, setTokenZeroDisplay] = useState(
    tokenIn.address != ''
      ? tokenIn.address.toString().substring(0, 6) +
          '...' +
          tokenIn.address
            .toString()
            .substring(
              tokenIn.address.toString().length - 4,
              tokenIn.address.toString().length,
            )
      : undefined,
  )
  const [tokenOneDisplay, setTokenOneDisplay] = useState(
    tokenOut.address != ''
      ? tokenOut.address.toString().substring(0, 6) +
          '...' +
          tokenOut.address
            .toString()
            .substring(
              tokenOut.address.toString().length - 4,
              tokenOut.address.toString().length,
            )
      : undefined,
  )
  const [poolDisplay, setPoolDisplay] = useState(
    poolAddress != ''
      ? poolAddress.toString().substring(0, 6) +
          '...' +
          poolAddress
            .toString()
            .substring(poolAddress.toString().length - 4, poolAddress.toString().length)
      : undefined,
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
    navigator.clipboard.writeText(poolAddress.toString())
    setIsPoolCopied(true)
  }

  useEffect(() => {
    fetchTokenPrice()
  }, [rangeTickPrice])

  useEffect(() => {
    changeTokenAmounts()
  }), [rangePrice]

  useEffect(() => {
    getRangePool()
  }, [tokenIn.address, tokenOut.address])

  const getRangePool = async () => {
    try {
      const pool = await getRangePoolFromFactory(
        tokenIn.address,
        tokenOut.address,
      )
      const dataLength = pool['data']['rangePools'].length
      if (dataLength > 0) {
        const id = pool['data']['rangePools']['0']['id']
        const token0Price = pool['data']['rangePools']['0']['token0']['usdPrice']
        const token1Price = pool['data']['rangePools']['0']['token1']['usdPrice']
        console.log('token prices', token0Price, token1Price)
        setRangePoolRoute(id)
        setAmount0Usd(amount0 * parseFloat(token0Price))
        setAmount1Usd(amount1 * parseFloat(token1Price))
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchTokenPrice = async () => {
    try {
      setMktRate({
        TOKEN20A:
          '~' +
          Number(rangeTickPrice).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          }),
        TOKEN20B: '~1.00',
      })
    } catch (error) {
      console.log(error)
    }
  }

  const changeTokenAmounts = () => {

  }

  return (
    <div className="bg-[url('/static/images/background.svg')] bg-no-repeat bg-cover min-h-screen font-Satoshi ">
      <Navbar />
      <div className="flex justify-center w-full text-white relative min-h-[calc(100vh-76px)] w-full">
        <div className="w-[55rem] absolute bottom-0">
          <div className="flex justify-between items-center mb-2">
            <div className="text-left flex items-center gap-x-5 py-2.5">
              <div className="flex items-center">
                <img height="50" width="50" src={tokenIn.logoURI} />
                <img
                  height="50"
                  width="50"
                  className="ml-[-12px]"
                  src={tokenOut.logoURI}
                />
              </div>
              <span className="text-3xl">
                {tokenIn.name}-{tokenOut.name}
              </span>
              <span className="bg-white text-black rounded-md px-3 py-0.5">
                {router.query.feeTier}%
              </span>
              {Number(rangeTickPrice) < Number(minLimit) ||
              Number(rangeTickPrice) > Number(maxLimit) ? (
                <div className="pr-5">
                  <div className="flex items-center bg-black py-2 px-5 rounded-lg gap-x-2 text-sm">
                    <ExclamationTriangleIcon className="w-4 text-yellow-600" />
                    Out of Range
                  </div>
                </div>
              ) : (
                <div className="flex items-center bg-black py-2 px-5 rounded-lg gap-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  In Range
                </div>
              )}
            </div>

            <a
              href={'https://goerli.arbiscan.io/address/' + poolAddress}
              target="_blank"
              rel="noreferrer"
              className="gap-x-2 flex items-center text-white cursor-pointer hover:opacity-80"
            >
              View on Arbiscan
              <ArrowTopRightOnSquareIcon className="w-5 " />
            </a>
          </div>
          <div className="mb-6">
            <div className="flex justify-between text-[#646464]">
              <div className="grid grid-cols-2 gap-x-10 pl-2 ">
                <h1
                  onClick={() => copyAddress0()}
                  className="text-xs cursor-pointer w-32"
                >
                  {tokenIn.name}:
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
                  {tokenOut.name}:
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
          <div className="bg-black  border border-grey2 border-b-none w-full rounded-t-xl py-6 px-7 h-[70vh] overflow-y-auto">
            <div className="flex gap-x-20 justify-between">
              <div className="w-1/2">
                <h1 className="text-lg mb-3">Liquidity</h1>
                <span className="text-4xl">
                  $
                  {userLiquidityUsd.toFixed(2)}
                </span>

                <div className="text-grey mt-3 space-y-2">
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="flex items-center gap-x-4">
                      <img height="30" width="30" src={tokenIn.logoURI} />
                      {tokenIn.name}
                    </div>
                    <div className="flex items-center gap-x-4">
                      {tokenIn.value}
                      <span className="bg-grey1 text-grey rounded-md px-3 py-0.5">
                        47%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="bg-grey1 text-grey rounded-md px-3 py-0.5">
                      {mktRate[tokenIn.symbol]}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="flex items-center gap-x-4">
                      <img height="30" width="30" src={tokenOut.logoURI} />
                      {tokenOut.name}
                    </div>
                    <div className="flex items-center gap-x-4">
                      {tokenOut.value}
                      <span className="bg-grey1 text-grey rounded-md px-3 py-0.5">
                        53%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="bg-grey1 text-grey rounded-md px-3 py-0.5">
                      {mktRate[tokenOut.symbol]}
                    </div>
                  </div>
                </div>
                <Link
                  href={{
                    pathname: '/pool/liquidity',
                    query: {
                      account: '',
                      poolAdd: poolAddress,
                      tokenOneName: tokenOut.name,
                      tokenOneSymbol: tokenOut.symbol,
                      tokenOneLogoURI: tokenOut.logoURI,
                      tokenOneAddress: tokenOut.address,
                      tokenZeroName: tokenIn.name,
                      tokenZeroSymbol: tokenIn.symbol,
                      tokenZeroLogoURI: tokenIn.logoURI,
                      tokenZeroAddress: tokenIn.address,
                      feeTier: feeTier,
                      tickSpacing: tickSpacing,
                      min: minLimit,
                      max: maxLimit,
                    },
                  }}
                >
                  <div className="mt-5 space-y-2 cursor-pointer">
                    <div className="bg-[#032851] w-full py-3 px-4 rounded-xl">
                      Increase Liquidity
                    </div>
                  </div>
                </Link>
              </div>
              <div className="w-1/2">
                <h1 className="text-lg mb-3">Unclaimed Fees</h1>
                <span className="text-4xl">
                  {router.query.unclaimedFees === undefined
                    ? '?'
                    : router.query.unclaimedFees.toString()}
                </span>
                <div className="text-grey mt-3 space-y-2">
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="flex items-center gap-x-4">
                      <img height="30" width="30" src={tokenIn.logoURI} />
                      {tokenIn.name}
                    </div>
                    <span>2.25</span>
                  </div>
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="flex items-center gap-x-4">
                      <img height="30" width="30" src={tokenOut.logoURI} />
                      {tokenOut.name}
                    </div>
                    <span>2.25</span>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <div className="space-y-3">
                    <RangeBurnButton
                      poolAddress={poolAddress}
                      address={address}
                      lower={BigNumber.from(minLimit)}
                      upper={BigNumber.from(maxLimit)}
                      amount={BigNumber.from(userLiquidity)}
                    />
                    <RangeCollectButton
                      poolAddress={poolAddress.toString()}
                      address={address}
                      lower={BigNumber.from(minLimit)}
                      upper={BigNumber.from(maxLimit)}
                    />
                    <RangeCompoundButton
                      poolAddress={poolAddress.toString()}
                      address={address}
                      lower={BigNumber.from(minLimit)}
                      upper={BigNumber.from(maxLimit)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex mt-7 gap-x-6 items-center">
                <h1 className="text-lg">Price Range </h1>
                {Number(rangeTickPrice) < Number(minLimit) ||
                Number(rangeTickPrice) > Number(maxLimit) ? (
                  <div className="pr-5">
                    <div className="flex items-center bg-black py-2 px-5 rounded-lg gap-x-2 text-sm">
                      <ExclamationTriangleIcon className="w-4 text-yellow-600" />
                      Out of Range
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center bg-black py-2 px-5 rounded-lg gap-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    In Range
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 gap-x-6">
              <div className="border border-grey1 rounded-xl py-2 text-center w-full">
                <div className="text-grey text-xs w-full">Min Price.</div>
                <div className="text-white text-2xl my-2 w-full">
                  {TickMath.getPriceStringAtTick(Number(minLimit), Number(tickSpacing))}
                </div>
                <div className="text-grey text-xs w-full">
                  {tokenIn.name} per {tokenOut.name}
                </div>
                <div className="text-grey text-xs w-full italic mt-1">
                  Your position will be 100% {tokenIn.name} at this price.
                </div>
              </div>
              <ArrowsRightLeftIcon className="w-12 text-grey" />
              <div className="border border-grey1 rounded-xl py-2 text-center w-full">
                <div className="text-grey text-xs w-full">Max Price.</div>
                <div className="text-white text-2xl my-2 w-full">
                  {TickMath.getPriceStringAtTick(Number(maxLimit), Number(tickSpacing))}
                </div>
                <div className="text-grey text-xs w-full">
                  {tokenIn.name} per {tokenOut.name}
                </div>
                <div className="text-grey text-xs w-full italic mt-1">
                  Your position will be 100% {tokenOut.name} at this price.
                </div>
              </div>
            </div>
            <div className="border border-grey1 rounded-xl py-2 text-center w-full mt-4 bg-dark">
              <div className="text-grey text-xs w-full">Current Price</div>
              <div className="text-white text-2xl my-2 w-full">{rangePrice != undefined && TickMath.getPriceStringAtSqrtPrice(JSBI.BigInt(rangePrice))}</div>
              <div className="text-grey text-xs w-full">
                {tokenIn.name} per {tokenOut.name}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
