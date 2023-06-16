import Navbar from '../../../components/Navbar'
import {
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/20/solid'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import RangeCollectButton from '../../../components/Buttons/RangeCollectButton'
import RangeCompoundButton from '../../../components/Buttons/RangeCompoundButton'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { BigNumber, ethers } from 'ethers'
import { TickMath } from '../../../utils/math/tickMath'
import JSBI from 'jsbi'
import { fetchTokenPrices } from '../../../utils/tokens'
import { token } from '../../../utils/types'
import { copyElementUseEffect } from '../../../utils/misc'
import { getRangePoolFromFactory } from '../../../utils/queries'
import { BN_ZERO, ZERO } from '../../../utils/math/constants'
import { DyDxMath } from '../../../utils/math/dydxMath'
import { rangePoolABI } from '../../../abis/evm/rangePool'
import { useContractRead } from 'wagmi'
import RemoveLiquidity from '../../../components/Modals/Range/RemoveLiquidity'
import AddLiquidity from '../../../components/Modals/Range/AddLiquidity'

export default function Range() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);

  const [poolAdd, setPoolAddress] = useState(router.query.poolId ?? '')
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
  const [tokenOrder, setTokenOrder] = useState(
    router.query.tokenOneAddress && router.query.tokenZeroAddress
      ? String(router.query.tokenOneAddress).localeCompare(
          String(router.query.tokenOneAddress),
        ) < 0
      : true,
  )
  const [feeTier, setFeeTier] = useState(router.query.feeTier ?? '')
  const [tickSpacing, setTickSpacing] = useState(router.query.tickSpacing ?? 10)
  const [userLiquidity, setUserLiquidity] = useState(
    router.query.userLiquidity ?? 0,
  )
  const [userTokenAmount, setUserTokenAmount] = useState(
    router.query.userTokenAmount ?? 0,
  )
  const [userLiquidityUsd, setUserLiquidityUsd] = useState(0)
  const [lowerTick, setLowerTick] = useState(router.query.min ?? '0')
  const [upperTick, setUpperTick] = useState(router.query.max ?? '0')
  const [lowerPrice, setLowerPrice] = useState(undefined)
  const [upperPrice, setUpperPrice] = useState(undefined)
  const [rangePrice, setRangePrice] = useState(
    router.query.price ? String(router.query.price) : '0',
  )
  const [amount0, setAmount0] = useState(0)
  const [amount1, setAmount1] = useState(0)
  const [amount0Usd, setAmount0Usd] = useState(0)
  const [amount1Usd, setAmount1Usd] = useState(0)
  const [amount0Fees, setAmount0Fees] = useState(0.0)
  const [amount1Fees, setAmount1Fees] = useState(0.0)
  const [amount0FeesUsd, setAmount0FeesUsd] = useState(0.0)
  const [amount1FeesUsd, setAmount1FeesUsd] = useState(0.0)
  const [rangePoolRoute, setRangePoolRoute] = useState(undefined)
  const [rangeTickPrice, setRangeTickPrice] = useState(
    router.query.rangeTickPrice ?? 0,
  )
  const [mktRate, setMktRate] = useState({})
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

  //////////////////////// Router is ready
  const [snapshot, setSnapshot] = useState(undefined)

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
      setTokenOrder(
        String(query.tokenOneAddress).localeCompare(
          String(query.tokenOneAddress),
        ) < 0,
      )
      setFeeTier(query.feeTier)
      setTickSpacing(query.tickSpacing)
      setLowerTick(query.min)
      setUpperTick(query.max)
      setLowerPrice(TickMath.getPriceStringAtTick(Number(query.min)))
      setUpperPrice(TickMath.getPriceStringAtTick(Number(query.max)))
      setRangePrice(String(query.price))
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
      setRangeTickPrice(query.rangeTickPrice)
      setUserLiquidity(query.userLiquidity)
    }
  }, [router.isReady])

  ////////////////////////Addresses

  useEffect(() => {
    copyElementUseEffect(copyAddress0, setIs0Copied)
    copyElementUseEffect(copyAddress1, setIs1Copied)
    copyElementUseEffect(copyPoolAddress, setIsPoolCopied)
  }, [])


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
    setIsPoolCopied(true)
  }

  ////////////////////////Pool

  useEffect(() => {
    getRangePool()
  }, [
    tokenIn.address,
    tokenOut.address,
    amount0,
    amount1,
    amount0Fees,
    amount1Fees,
  ])

  const getRangePool = async () => {
    try {
      const pool = await getRangePoolFromFactory(
        tokenIn.address,
        tokenOut.address,
      )
      const dataLength = pool['data']['rangePools'].length
      if (dataLength > 0) {
        const id = pool['data']['rangePools']['0']['id']
        const price = pool['data']['rangePools']['0']['price']
        const token0Price =
          pool['data']['rangePools']['0']['token0']['usdPrice']
        const token1Price =
          pool['data']['rangePools']['0']['token1']['usdPrice']
        const tickAtPrice = pool['data']['rangePools']['0']['tickAtPrice']
        setRangePoolRoute(id)
        setAmount0Usd(
          parseFloat((amount0 * parseFloat(token0Price)).toPrecision(6)),
        )
        setAmount1Usd(
          parseFloat((amount1 * parseFloat(token1Price)).toPrecision(6)),
        )
        setAmount0FeesUsd(
          parseFloat((amount0Fees * parseFloat(token0Price)).toPrecision(3)),
        )
        setAmount1FeesUsd(
          parseFloat((amount1Fees * parseFloat(token1Price)).toPrecision(3)),
        )
        setRangePrice(price)
        setRangeTickPrice(tickAtPrice)
      }
    } catch (error) {
      console.log(error)
    }
  }

  ////////////////////////Liquidity

  useEffect(() => {
    setAmounts()
  }, [userLiquidity, lowerPrice, upperPrice, rangePrice])

  function setAmounts() {
    try {
      if (
        !isNaN(parseFloat(lowerPrice)) &&
        !isNaN(parseFloat(upperPrice)) &&
        !isNaN(parseFloat(String(rangePrice))) &&
        Number(userLiquidity) > 0 &&
        parseFloat(lowerPrice) < parseFloat(upperPrice)
      ) {
        const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(Number(lowerTick))
        const upperSqrtPrice = TickMath.getSqrtRatioAtTick(Number(upperTick))
        const rangeSqrtPrice = JSBI.BigInt(rangePrice)
        const liquidity = JSBI.BigInt(userLiquidity)
        const amounts = DyDxMath.getAmountsForLiquidity(
          lowerSqrtPrice,
          upperSqrtPrice,
          rangeSqrtPrice,
          liquidity,
          true
        )
        // set amount based on bnInput
        const amount0Bn = BigNumber.from(String(amounts.token0Amount))
        const amount1Bn = BigNumber.from(String(amounts.token1Amount))
        setAmount0(parseFloat(ethers.utils.formatUnits(amount0Bn, 18)))
        setAmount1(parseFloat(ethers.utils.formatUnits(amount1Bn, 18)))
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    setUserLiquidityUsd(amount0Usd + amount1Usd)
  }, [amount0Usd, amount1Usd])


  ////////////////////////Fees

  const { refetch: refetchSnapshot, data: feesOwed } = useContractRead({
    address: rangePoolRoute,
    abi: rangePoolABI,
    functionName: 'snapshot',
    args: [[address, lowerTick, upperTick]],
    chainId: 421613,
    watch: true,
    enabled: isConnected && rangePoolRoute != '',
    onSuccess(data) {
      setSnapshot(data)
      console.log('Success snapshot Range', data)
    },
    onError(error) {
      console.log('Error snapshot Range', error)
    },
  })

  useEffect(() => {
    setFeesOwed()
  }, [snapshot])

  function setFeesOwed() {
    try {
      if (snapshot) {
        const fees0 = parseFloat(ethers.utils.formatUnits(snapshot[3], 18))
        const fees1 = parseFloat(ethers.utils.formatUnits(snapshot[4], 18))
        setAmount0Fees(fees0)
        setAmount1Fees(fees1)
      }
    } catch (error) {
      console.log(error)
    }
  }

  ////////////////////////Token Prices
  
  useEffect(() => {
    fetchTokenPrices(String(rangeTickPrice), setMktRate)
  }, [rangeTickPrice])

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
              {Number(rangeTickPrice) < Number(lowerTick) ||
              Number(rangeTickPrice) > Number(upperTick) ? (
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
                <span className="text-4xl">${userLiquidityUsd.toFixed(2)}</span>
                <div className="text-grey mt-3 space-y-2">
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="flex items-center gap-x-4">
                      <img height="30" width="30" src={tokenIn.logoURI} />
                      {tokenIn.name}
                    </div>
                    <div className="flex items-center gap-x-4">
                      {amount0.toFixed(2)}
                      <span className="bg-grey1 text-grey rounded-md px-3 py-0.5">
                        {(
                          (amount0Usd / (amount0Usd + amount1Usd)) *
                          100
                        ).toFixed(2)}
                        %
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="bg-grey1 text-grey rounded-md px-3 py-0.5">
                      ${amount0Usd}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="flex items-center gap-x-4">
                      <img height="30" width="30" src={tokenOut.logoURI} />
                      {tokenOut.name}
                    </div>
                    <div className="flex items-center gap-x-4">
                      {amount1.toFixed(2)}
                      <span className="bg-grey1 text-grey rounded-md px-3 py-0.5">
                        {(
                          (amount1Usd / (amount0Usd + amount1Usd)) *
                          100
                        ).toFixed(2)}
                        %
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="bg-grey1 text-grey rounded-md px-3 py-0.5">
                      ${amount1Usd}
                    </div>
                  </div>
                </div>
                  <div className="mt-5 space-y-2 cursor-pointer">
                      <div onClick={() => setIsAddOpen(true)} className="bg-[#032851] w-full py-3 px-4 rounded-xl">
                        Add Liquidity
                      </div>
                    <div onClick={() => setIsRemoveOpen(true)} className="bg-[#032851] w-full py-3 px-4 rounded-xl">
                      Remove Liquidity
                    </div>
                  </div>
                    
              </div>
              <div className="w-1/2">
                <h1 className="text-lg mb-3">Unclaimed Fees</h1>
                <span className="text-4xl">
                  {' '}
                  $
                  {amount0Fees == undefined || amount1Fees == undefined
                    ? '?'
                    : (amount0FeesUsd + amount1FeesUsd).toFixed(2)}
                </span>
                <div className="text-grey mt-3 space-y-2">
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="flex items-center gap-x-4">
                      <img height="30" width="30" src={tokenIn.logoURI} />
                      {tokenIn.name}
                    </div>
                    <span>{amount0FeesUsd.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="flex items-center gap-x-4">
                      <img height="30" width="30" src={tokenOut.logoURI} />
                      {tokenOut.name}
                    </div>
                    <span>{amount1FeesUsd.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <div className="space-y-3">
                    <RangeCollectButton
                      poolAddress={poolAdd.toString()}
                      address={address}
                      lower={BigNumber.from(lowerTick)}
                      upper={BigNumber.from(upperTick)}
                    />
                    <RangeCompoundButton
                      poolAddress={poolAdd.toString()}
                      address={address}
                      lower={BigNumber.from(lowerTick)}
                      upper={BigNumber.from(upperTick)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex mt-7 gap-x-6 items-center">
                <h1 className="text-lg">Price Range </h1>
                {Number(rangeTickPrice) < Number(lowerTick) ||
                Number(rangeTickPrice) >= Number(upperTick) ? (
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
                <div className="text-grey text-xs w-full">Min. Price</div>
                <div className="text-white text-2xl my-2 w-full">
                  {lowerPrice}
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
                <div className="text-grey text-xs w-full">Max. Price</div>
                <div className="text-white text-2xl my-2 w-full">
                  {upperPrice}
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
              <div className="text-white text-2xl my-2 w-full">
                {rangePrice != undefined &&
                  TickMath.getPriceStringAtSqrtPrice(JSBI.BigInt(rangePrice))}
              </div>
              <div className="text-grey text-xs w-full">
                {tokenIn.name} per {tokenOut.name}
              </div>
            </div>
          </div>
        </div>
      </div>
      <RemoveLiquidity
        isOpen={isRemoveOpen}
        setIsOpen={setIsRemoveOpen}
        tokenIn={tokenIn}
        tokenOut={tokenOut}
        poolAdd={poolAdd}
        address={address}
        lowerTick={lowerTick}
        upperTick={upperTick}
        liquidity={userLiquidity}
        tokenAmount={userTokenAmount}
        rangePrice={rangePrice}
      />
      <AddLiquidity
        isOpen={isAddOpen}
        setIsOpen={setIsAddOpen}
        tokenIn={tokenIn}
        tokenOut={tokenOut}
        poolAdd={poolAdd}
        address={address}
        lowerTick={Number(lowerTick)}
        upperTick={Number(upperTick)}
        liquidity={userLiquidity}
        rangePrice={rangePrice}
      />
    </div>
  )
}
