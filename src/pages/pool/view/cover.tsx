import Navbar from '../../../components/Navbar'
import {
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  ArrowLongRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/20/solid'
import { useState, useEffect } from 'react'
import CoverBurnButton from '../../../components/Buttons/CoverBurnButton'
import CoverCollectButton from '../../../components/Buttons/CoverCollectButton'
import { useRouter } from 'next/router'
import { useAccount, useContractRead } from 'wagmi'
import Link from 'next/link'
import { BigNumber, ethers } from 'ethers'
import {
  getTickIfNotZeroForOne,
  getTickIfZeroForOne,
} from '../../../utils/queries'
import { TickMath } from '../../../utils/math/tickMath'
import { coverPoolABI } from '../../../abis/evm/coverPool'

export default function Cover() {
  type token = {
    name: string
    symbol: string
    logoURI: string
    address: string
    value: string
  }
  const { address } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (router.isReady) {
      const query = router.query
      setPoolContractAdd(query.poolId)
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
      setLatestTick(query.latestTick)
      setEpochLast(query.epochLast)
      setLiquidity(query.liquidity)
      setFeeTier(query.feeTier)
      setMinLimit(query.min)
      setMaxLimit(query.max)
      setUserFillIn(query.userFillIn)
      setUserFillOut(query.userFillOut)
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
      setCoverPoolRoute(query.coverPoolRoute)
      setCoverTickPrice(query.coverTickPrice)
    }
  }, [router.isReady])

  const [poolAdd, setPoolContractAdd] = useState(router.query.poolId ?? '')
  const [tokenIn, setTokenIn] = useState({
    name: router.query.tokenZeroAddress ?? '',
    symbol: router.query.tokenZeroSymbol ?? '',
    logoURI: router.query.tokenZeroLogoURI ?? '',
    address: router.query.tokenZeroAddress ?? '',
    value: router.query.tokenZeroValue ?? '',
  } as token)
  const [tokenOut, setTokenOut] = useState({
    name: router.query.tokenOneAddress ?? '',
    symbol: router.query.tokenOneSymbol ?? '',
    logoURI: router.query.tokenOneLogoURI ?? '',
    address: router.query.tokenOneAddress ?? '',
    value: router.query.tokenOneValue ?? '',
  } as token)
  const [latestTick, setLatestTick] = useState(router.query.latestTick ?? 0)
  const [liquidity, setLiquidity] = useState(router.query.liquidity ?? '0')
  const [feeTier, setFeeTier] = useState(router.query.feeTier ?? '')
  const [minLimit, setMinLimit] = useState(router.query.min ?? '0')
  const [maxLimit, setMaxLimit] = useState(router.query.max ?? '0')
  const [userFillIn, setUserFillIn] = useState(router.query.userFillIn ?? '0')
  const [userFillOut, setUserFillOut] = useState(
    router.query.userFillOut ?? '0',
  )
  const [mktRate, setMktRate] = useState({})
  const [epochLast, setEpochLast] = useState(router.query.epochLast ?? 0)
  const [zeroForOne, setZeroForOne] = useState(true)
  const [coverFilledAmount, setCoverFilledAmount] = useState('')
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
    poolAdd != ''
      ? poolAdd.toString().substring(0, 6) +
          '...' +
          poolAdd
            .toString()
            .substring(poolAdd.toString().length - 4, poolAdd.toString().length)
      : undefined,
  )
  const [coverPoolRoute, setCoverPoolRoute] = useState(
    router.query.coverPoolRoute ?? '',
  )
  const [coverTickPrice, setCoverTickPrice] = useState(
    router.query.coverTickPrice ?? '0',
  )
  const [claimTick, setClaimTick] = useState(BigNumber.from(0))

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
    getClaimTick()
  }, [minLimit, maxLimit, poolAdd])

  function copyAddress0() {
    navigator.clipboard.writeText(tokenIn.address.toString())
    setIs0Copied(true)
  }

  function copyAddress1() {
    navigator.clipboard.writeText(tokenOut.address.toString())
    setIs1Copied(true)
  }

  function copyPoolAddress() {
    navigator.clipboard.writeText(poolAdd.toString())
    setIsPoolCopied
  }

  const fetchTokenPrice = async () => {
    try {
      setMktRate({
        TOKEN20A:
          '~' +
          Number(coverTickPrice).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          }),
        TOKEN20B: '~1.00',
      })
    } catch (error) {
      console.log(error)
    }
  }

  const { data: filledAmount } = useContractRead({
    address: coverPoolRoute.toString(),
    abi: coverPoolABI,
    functionName: 'snapshot',
    args: [[
      address,
      BigNumber.from('0'),
      minLimit,
      maxLimit,
      claimTick,
      zeroForOne
    ]],
    chainId: 421613,
    watch: true,
    enabled: claimTick != undefined,
    onSuccess(data) {
      console.log('Success price filled amount', data)
      setCoverFilledAmount(ethers.utils.formatUnits(data[1], 18))
    },
    onError(error) {
      console.log('Error price Cover', error)
    },
    onSettled(data, error) {
      //console.log('Settled price Cover', { data, error })
    },
  })

  const getClaimTick = async () => {
   setZeroForOne(tokenOut.address != '' && tokenIn.address.localeCompare(tokenOut.address) === -1)
    let claimTick = zeroForOne ? maxLimit : minLimit
    if (zeroForOne) {
      const claimTickQuery = await getTickIfZeroForOne(
        Number(maxLimit),
        poolAdd.toString(),
        Number(epochLast),
      )
      const claimTickDataLength = claimTickQuery['data']['ticks'].length
      if (claimTickDataLength > 0) claimTick = claimTickQuery['data']['ticks'][0]['index']
    } else {
      const claimTickQuery = await getTickIfNotZeroForOne(
        Number(minLimit),
        poolAdd.toString(),
        Number(1),
      )
      const claimTickDataLength = claimTickQuery['data']['ticks'].length
      if (claimTickDataLength > 0) claimTick = claimTickQuery['data']['ticks'][0]['index']
      if (claimTick != undefined) {
        setClaimTick(BigNumber.from(claimTick))
      } else {
        setClaimTick(BigNumber.from(minLimit))
      }
    }
    setClaimTick(BigNumber.from(claimTick))
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
              <span className="text-3xl flex items-center gap-x-3">
                {tokenIn.name} <ArrowLongRightIcon className="w-5 " />{' '}
                {tokenOut.name}
              </span>
              <span className="bg-white text-black rounded-md px-3 py-0.5">
                {feeTier}%
              </span>
              {Number(coverTickPrice) < Number(minLimit) ||
              Number(coverTickPrice) > Number(maxLimit) ? (
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
              href={'https://goerli.arbiscan.io/address/' + poolAdd}
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
                  {tokenOut.name}:
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
                  {tokenIn.name}:
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
                <h1 className="text-lg mb-3">Cover Size</h1>
                <span className="text-4xl">
                  $
                  {Number(
                    ethers.utils.formatUnits(userFillOut.toString(), 18),
                  ).toFixed(2)}
                </span>

                <div className="text-grey mt-3 space-y-2">
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="flex items-center gap-x-4">
                      <img height="30" width="30" src={tokenIn.logoURI} />
                      {tokenIn.name}
                    </div>
                    {Number(
                      ethers.utils.formatUnits(userFillOut.toString(), 18),
                    ).toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                  <div className="bg-grey1 text-grey rounded-md px-3 py-0.5">
                    {mktRate[tokenIn.symbol]}
                  </div>
                </div>
                <Link
                  href={{
                    pathname: '/pool/directional',
                    query: {
                      account: router.query.account,
                      poolId: poolAdd,
                      tokenOneName: tokenOut.name,
                      tokenOneSymbol: tokenOut.symbol,
                      tokenOneLogoURI: tokenOut.logoURI,
                      tokenOneAddress: tokenOut.address,
                      tokenZeroName: tokenIn.name,
                      tokenZeroSymbol: tokenIn.symbol,
                      tokenZeroLogoURI: tokenIn.logoURI,
                      tokenZeroAddress: tokenIn.address,
                    },
                  }}
                >
                  <div className="mt-5 space-y-2 cursor-pointer">
                    <div className="bg-[#032851] w-full py-3 px-4 rounded-xl">
                      Add Liquidity
                    </div>
                  </div>
                </Link>
              </div>
              <div className="w-1/2">
                <h1 className="text-lg mb-3">Filled Position</h1>
                <span className="text-4xl">
                  ${' '}
                  {Number(
                    coverFilledAmount,
                  ).toFixed(2)}
                  <span className="text-grey">
                    /$
                    {Number(
                      ethers.utils.formatUnits(userFillIn.toString(), 18),
                    ).toFixed(2)}
                  </span>
                </span>
                <div className="text-grey mt-3">
                  <div className="flex items-center relative justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="absolute left-0 h-full w-[30%] bg-white rounded-l-xl opacity-10"/>
                    <div className="flex items-center gap-x-4 z-20">
                      <img height="30" width="30" src={tokenOut.logoURI} />
                      {tokenOut.name}
                    </div>
                    <span className="text-white z-20">
                    {Number(
                    coverFilledAmount,
                  ).toFixed(2)}<span className="text-grey">/{Number(
                      ethers.utils.formatUnits(userFillIn.toString(), 18),
                    ).toFixed(2)}</span>
                    </span>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <div className="space-y-3">
                    {/**TO-DO: PASS PROPS */}
                    <CoverBurnButton
                      poolAddress={poolAdd}
                      address={address}
                      lower={minLimit}
                      claim={claimTick}
                      upper={maxLimit}
                      zeroForOne={
                        tokenOut.address != '' &&
                        tokenIn.address.localeCompare(tokenOut.address) === -1
                      }
                      amount={liquidity}
                    />
                    <CoverCollectButton
                      poolAddress={poolAdd}
                      address={address}
                      lower={minLimit}
                      claim={claimTick}
                      upper={maxLimit}
                      zeroForOne={
                        tokenOut.address != '' &&
                        tokenIn.address.localeCompare(tokenOut.address) === -1
                      }
                    />
                    {/*TO-DO: add positionOwner ternary again*/}
                  </div>
                </div>
              </div>
            </div>
            <div>
            </div>
            <div className="flex justify-between items-center mt-4 gap-x-6">
              <div className="border border-grey1 rounded-xl py-2 text-center w-full">
                <div className="text-grey text-xs w-full">Min Price</div>
                <div className="text-white text-2xl my-2 w-full">
                 {minLimit === undefined ? '' : TickMath.getPriceStringAtTick(Number(minLimit))}
                </div>
                <div className="text-grey text-xs w-full">
                  {tokenIn.name} per {tokenOut.name}
                </div>
                <div className="text-grey text-xs w-full italic mt-1">
                  Your position will be 100%{tokenIn.name} at this price.
                </div>
              </div>
              <ArrowsRightLeftIcon className="w-12 text-grey" />
              <div className="border border-grey1 rounded-xl py-2 text-center w-full">
                <div className="text-grey text-xs w-full">Max Price</div>
                <div className="text-white text-2xl my-2 w-full">
                  {maxLimit === undefined ? '' : TickMath.getPriceStringAtTick(Number(maxLimit))}
                </div>
                <div className="text-grey text-xs w-full">
                  {tokenIn.name} per {tokenOut.name}
                </div>
                <div className="text-grey text-xs w-full italic mt-1">
                  Your position will be 100%{tokenIn.name} at this price.
                </div>
              </div>
            </div>
            <div className="border border-grey1 rounded-xl py-2 text-center w-full mt-4 bg-dark">
              <div className="text-grey text-xs w-full">Current Price</div>
              <div className="text-white text-2xl my-2 w-full">{TickMath.getPriceStringAtTick(Number(latestTick))}</div>
              <div className="text-grey text-xs w-full">
                {tokenIn.name} per {tokenOut.name}
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mt-10 mb-5">
                <h1 className="text-lg">Original pool being covered </h1>
                <h1 className="text-grey">
                  Type: <span className="text-white">UNI-V3</span>
                </h1>
              </div>
              <div className="w-full cursor-pointer flex justify-between items-center bg-dark border border-grey2 rounded-xl py-3.5 pl-5 h-24 relative">
                <div className="space-y-2">
                  <div className="flex items-center gap-x-5">
                    <div className="flex items-center ">
                      <img height="30" width="30" src={tokenIn.logoURI} />
                      <img
                        height="30"
                        width="30"
                        className="ml-[-8px]"
                        src={tokenOut.logoURI}
                      />
                    </div>
                    <div className="flex gap-x-2">
                      {tokenIn.name} -{tokenOut.name}
                    </div>
                    <div className="bg-black px-2 py-1 rounded-lg text-grey">
                      0.5%
                    </div>
                  </div>
                  <div className="text-sm flex items-center gap-x-3">
                    <span>
                      <span className="text-grey">Min:</span> 1203
                      {tokenIn.name} per {tokenOut.name}
                    </span>
                    <ArrowsRightLeftIcon className="w-4 text-grey" />
                    <span>
                      <span className="text-grey">Max:</span> 1643
                      {tokenIn.name} per {tokenOut.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
