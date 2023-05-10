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
import { useAccount, useContractRead } from 'wagmi'
import { BigNumber, ethers } from 'ethers'
import { getRangePoolFromFactory } from '../../../utils/queries'
import { rangePoolABI } from '../../../abis/evm/rangePool'

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
  const zeroAddress =
    router.query.tokenZeroAddress === undefined
      ? ''
      : router.query.tokenZeroAddress.toString()
  const oneAddress =
    router.query.tokenOneAddress === undefined
      ? ''
      : router.query.tokenOneAddress.toString()
  const poolAddress =
    router.query.poolId === undefined ? '' : router.query.poolId.toString()
  const min =
    router.query.min === undefined ? '0' : router.query.min.toString()
  const max =
    router.query.max === undefined ? '0' : router.query.max.toString()
  const liquidity =
    router.query.liquidity === undefined ? '0' : router.query.liquidity.toString()

  const [is0Copied, setIs0Copied] = useState(false)
  const [is1Copied, setIs1Copied] = useState(false)
  const [isPoolCopied, setIsPoolCopied] = useState(false)
  const [tokenZeroDisplay, setTokenZeroDisplay] = useState(
    zeroAddress.substring(0, 6) +
      '...' +
      zeroAddress.substring(zeroAddress.length - 4, zeroAddress.length),
  )
  const [tokenOneDisplay, setTokenOneDisplay] = useState(
    oneAddress.substring(0, 6) +
      '...' +
      oneAddress.substring(oneAddress.length - 4, oneAddress.length),
  )
  const [poolDisplay, setPoolDisplay] = useState(
    poolAddress.substring(0, 6) +
      '...' +
      poolAddress.substring(poolAddress.length - 4, poolAddress.length),
  )
  const [poolContractAdd, setPoolContractAdd] = useState(
    router.query.poolId ?? undefined,
  )
  const [tokenIn, setTokenIn] = useState({
    name: router.query.tokenZeroName,
    symbol: router.query.tokenZeroSymbol,
    logoURI: router.query.tokenZeroLogoURI,
    address: router.query.tokenZeroAddress,
    value: router.query.tokenZeroValue,
  } as token)
  const [tokenOut, setTokenOut] = useState({
    name: router.query.tokenOneName,
    symbol: router.query.tokenOneSymbol,
    logoURI: router.query.tokenOneLogoURI,
    address: router.query.tokenOneAddress,
    value: router.query.tokenOneValue,
  } as token)
  const [rangePoolRoute, setRangePoolRoute] = useState(undefined)
  const [rangePrice, setRangePrice] = useState(undefined)
  const [mktRate, setMktRate] = useState({})

  const { refetch: refetchRangePrice, data: priceRange } = useContractRead({
    address: rangePoolRoute,
    abi: rangePoolABI,
    functionName: 'poolState',
    args: [],
    chainId: 421613,
    watch: true,
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

  useEffect(() => {
    getRangePool()
  }, [])

  useEffect(() => {
    fetchTokenPrice()
  }, [rangePrice])

  function copyAddress0() {
    navigator.clipboard.writeText(
      router.query.tokenZeroAddress === undefined
        ? ''
        : router.query.tokenZeroAddress.toString(),
    )
    setIs0Copied(true)
  }

  function copyAddress1() {
    navigator.clipboard.writeText(
      router.query.tokenOneAddress === undefined
        ? ''
        : router.query.tokenOneAddress.toString(),
    )
    setIs1Copied(true)
  }

  function copyPoolAddress() {
    navigator.clipboard.writeText(
      router.query.poolId === undefined ? '' : router.query.poolId.toString(),
    )
    setIsPoolCopied(true)
  }

  const getRangePool = async () => {
    try {
      const pool = await getRangePoolFromFactory(
        tokenIn.address,
        tokenOut.address,
      )
      const id = pool['data']['rangePools']['0']['id']
      console.log('range pool address in view', id)

      setRangePoolRoute(id)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchTokenPrice = async () => {
    try {
      setMktRate({
        TOKEN20A:
          '~' +
          Number(rangePrice).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          }),
        TOKEN20B: '~1.00',
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="bg-[url('/static/images/background.svg')] bg-no-repeat bg-cover min-h-screen font-Satoshi ">
      <Navbar />
      <div className="flex justify-center w-full text-white relative min-h-[calc(100vh-76px)] w-full">
        <div className="w-[55rem] absolute bottom-0">
          <div className="flex justify-between items-center mb-2">
            <div className="text-left flex items-center gap-x-5 py-2.5">
              <div className="flex items-center">
                <img
                  height="50"
                  width="50"
                  src={
                    router.query.tokenZeroLogoURI === undefined
                      ? ''
                      : router.query.tokenZeroLogoURI.toString()
                  }
                />
                <img
                  height="50"
                  width="50"
                  className="ml-[-12px]"
                  src={
                    router.query.tokenOneLogoURI === undefined
                      ? ''
                      : router.query.tokenOneLogoURI.toString()
                  }
                />
              </div>
              <span className="text-3xl">
                {router.query.tokenZeroName}-{router.query.tokenOneName}
              </span>
              <span className="bg-white text-black rounded-md px-3 py-0.5">
                {router.query.feeTier}%
              </span>
              {mktRate[tokenIn.symbol] && rangePrice ? (
                parseFloat(mktRate[tokenIn.symbol].replace(/[^\d.-]/g, '')) /
                  parseFloat(mktRate[tokenOut.symbol].replace(/[^\d.-]/g, '')) <
                  Number(router.query.min) ||
                parseFloat(mktRate[tokenIn.symbol].replace(/[^\d.-]/g, '')) /
                  parseFloat(mktRate[tokenOut.symbol].replace(/[^\d.-]/g, '')) >
                  Number(router.query.max) ? (
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
                )
              ) : (
                <></>
              )}
            </div>
            <a href="#">
              <a
                href={'https://goerli.arbiscan.io/address/' + poolAddress}
                target="_blank"
                rel="noreferrer"
                className="gap-x-2 flex items-center text-white cursor-pointer hover:opacity-80"
              >
                View on Arbiscan
                <ArrowTopRightOnSquareIcon className="w-5 " />
              </a>
            </a>
          </div>
          <div className="mb-6">
            <div className="flex justify-between text-[#646464]">
              <div className="grid grid-cols-2 gap-x-10 pl-2 ">
                <h1
                  onClick={() => copyAddress0()}
                  className="text-xs cursor-pointer w-32"
                >
                  {router.query.tokenZeroName}:
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
                  {router.query.tokenOneName}:
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
                  {Number(
                    ethers.utils.formatUnits(
                      router.query.liquidity === undefined
                        ? '0'
                        : router.query.liquidity.toString(),
                      18,
                    ),
                  ).toFixed(2)}
                </span>

                <div className="text-grey mt-3 space-y-2">
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="flex items-center gap-x-4">
                      <img
                        height="30"
                        width="30"
                        src={
                          router.query.tokenZeroLogoURI === undefined
                            ? '?'
                            : router.query.tokenZeroLogoURI.toString()
                        }
                      />
                      {router.query.tokenZeroName}
                    </div>
                    <div className="flex items-center gap-x-4">
                      {router.query.tokenZeroValue === undefined
                        ? '?'
                        : router.query.tokenZeroValue.toString()}
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
                      <img
                        height="30"
                        width="30"
                        src={
                          router.query.tokenOneLogoURI === undefined
                            ? '0'
                            : router.query.tokenOneLogoURI.toString()
                        }
                      />
                      {router.query.tokenOneName}
                    </div>
                    <div className="flex items-center gap-x-4">
                      {router.query.tokenOneValue === undefined
                        ? '0'
                        : router.query.tokenOneValue.toString()}
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
                      account:
                        router.query.account === undefined
                          ? ''
                          : router.query.account.toString(),
                      poolId:
                        router.query.poolId === undefined
                          ? ''
                          : router.query.poolId.toString(),
                      tokenOneName:
                        router.query.tokenOneName === undefined
                          ? ''
                          : router.query.tokenOneName.toString(),
                      tokenOneSymbol:
                        router.query.tokenOneSymbol === undefined
                          ? ''
                          : router.query.tokenOneSymbol.toString(),
                      tokenOneLogoURI:
                        router.query.tokenOneLogoURI === undefined
                          ? ''
                          : router.query.tokenOneLogoURI.toString(),
                      tokenOneAddress:
                        router.query.tokenOneAddress === undefined
                          ? ''
                          : router.query.tokenOneAddress.toString(),
                      tokenZeroName:
                        router.query.tokenZeroName === undefined
                          ? ''
                          : router.query.tokenZeroName.toString(),
                      tokenZeroSymbol:
                        router.query.tokenZeroSymbol === undefined
                          ? ''
                          : router.query.tokenZeroSymbol.toString(),
                      tokenZeroLogoURI:
                        router.query.tokenZeroLogoURI === undefined
                          ? ''
                          : router.query.tokenZeroLogoURI.toString(),
                      tokenZeroAddress:
                        router.query.tokenZeroAddress === undefined
                          ? ''
                          : router.query.tokenZeroAddress.toString(),
                      feeTier:
                        router.query.feeTier === undefined
                          ? ''
                          : router.query.feeTier.toString(),
                      min:
                        router.query.min === undefined
                          ? ''
                          : router.query.min.toString(),
                      max:
                        router.query.max === undefined
                          ? ''
                          : router.query.max.toString(),
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
                      <img
                        height="30"
                        width="30"
                        src={
                          router.query.tokenZeroLogoURI === undefined
                            ? ''
                            : router.query.tokenZeroLogoURI.toString()
                        }
                      />
                      {router.query.tokenZeroName}
                    </div>
                    <span>2.25</span>
                  </div>
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="flex items-center gap-x-4">
                      <img
                        height="30"
                        width="30"
                        src={
                          router.query.tokenOneLogoURI === undefined
                            ? ''
                            : router.query.tokenOneLogoURI.toString()
                        }
                      />
                      {router.query.tokenZeroName}
                    </div>
                    <span>2.25</span>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <div className="space-y-3">
                    <RangeBurnButton
                      poolAddress={poolAddress}
                      address={address}
                      lower={BigNumber.from(min)}
                      upper={BigNumber.from(max)}
                      amount={BigNumber.from(liquidity)}
                    />
                    <RangeCollectButton
                      poolAddress={poolAddress}
                      address={address}
                      lower={BigNumber.from(min)}
                      upper={BigNumber.from(max)}
                    />
                    <RangeCompoundButton
                      poolAddress={poolAddress}
                      address={address}
                      lower={BigNumber.from(min)}
                      upper={BigNumber.from(max)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex mt-7 gap-x-6 items-center">
                <h1 className="text-lg">Price Range </h1>
                {mktRate[tokenIn.symbol] && rangePrice ? (
                  parseFloat(mktRate[tokenIn.symbol].replace(/[^\d.-]/g, '')) /
                    parseFloat(
                      mktRate[tokenOut.symbol].replace(/[^\d.-]/g, ''),
                    ) <
                    Number(router.query.min) ||
                  parseFloat(mktRate[tokenIn.symbol].replace(/[^\d.-]/g, '')) /
                    parseFloat(
                      mktRate[tokenOut.symbol].replace(/[^\d.-]/g, ''),
                    ) >
                    Number(router.query.max) ? (
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
                  )
                ) : (
                  <></>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 gap-x-6">
              <div className="border border-grey1 rounded-xl py-2 text-center w-full">
                <div className="text-grey text-xs w-full">Min Price.</div>
                <div className="text-white text-2xl my-2 w-full">
                  {router.query.min === undefined
                    ? '?'
                    : router.query.min.toString()}
                </div>
                <div className="text-grey text-xs w-full">
                  {router.query.tokenZeroName} per {router.query.tokenOneName}
                </div>
                <div className="text-grey text-xs w-full italic mt-1">
                  Your position will be 100% {router.query.tokenZeroName} at
                  this price.
                </div>
              </div>
              <ArrowsRightLeftIcon className="w-12 text-grey" />
              <div className="border border-grey1 rounded-xl py-2 text-center w-full">
                <div className="text-grey text-xs w-full">Max Price.</div>
                <div className="text-white text-2xl my-2 w-full">
                  {router.query.max === undefined
                    ? '?'
                    : router.query.max.toString()}
                </div>
                <div className="text-grey text-xs w-full">
                  {router.query.tokenZeroName} per {router.query.tokenOneName}
                </div>
                <div className="text-grey text-xs w-full italic mt-1">
                  Your position will be 100% {router.query.tokenOneName} at this
                  price.
                </div>
              </div>
            </div>
            <div className="border border-grey1 rounded-xl py-2 text-center w-full mt-4 bg-dark">
              <div className="text-grey text-xs w-full">Current Price</div>
              <div className="text-white text-2xl my-2 w-full">1.064</div>
              <div className="text-grey text-xs w-full">
                {router.query.tokenZeroName} per {router.query.tokenOneName}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
