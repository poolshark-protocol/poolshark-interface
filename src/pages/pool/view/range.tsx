import Navbar from '../../../components/Navbar'
import {
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/20/solid'
import { useState, useEffect } from 'react'
import RangeCompoundButton from '../../../components/Buttons/RangeCompoundButton'
import { useAccount } from 'wagmi'
import { BigNumber, ethers } from 'ethers'
import { TickMath } from '../../../utils/math/tickMath'
import JSBI from 'jsbi'
import { copyElementUseEffect } from '../../../utils/misc'
import { DyDxMath } from '../../../utils/math/dydxMath'
import { rangePoolABI } from '../../../abis/evm/rangePool'
import { useContractRead } from 'wagmi'
import RemoveLiquidity from '../../../components/Modals/Range/RemoveLiquidity'
import AddLiquidity from '../../../components/Modals/Range/AddLiquidity'
import { useRangeStore } from '../../../hooks/useRangeStore'
import { fetchRangeTokenUSDPrice } from '../../../utils/tokens'

export default function Range() {
  const [
    rangePoolAddress,
    rangePoolData,
    rangePositionData,
    tokenIn,
    tokenOut,
    tokenInRangeUSDPrice,
    tokenOutRangeUSDPrice,
    setTokenInRangeUSDPrice,
    setTokenOutRangeUSDPrice,
  ] = useRangeStore((state) => [
    state.rangePoolAddress,
    state.rangePoolData,
    state.rangePositionData,
    state.tokenIn,
    state.tokenOut,
    state.tokenInRangeUSDPrice,
    state.tokenOutRangeUSDPrice,
    state.setTokenInRangeUSDPrice,
    state.setTokenOutRangeUSDPrice,
  ])

  const { address, isConnected } = useAccount()

  const [snapshot, setSnapshot] = useState(undefined)
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [priceDirection, setPriceDirection] = useState(false);

  const [userLiquidityUsd, setUserLiquidityUsd] = useState(0)
  const [lowerPrice, setLowerPrice] = useState("")
  const [upperPrice, setUpperPrice] = useState("")
  const [amount0, setAmount0] = useState(0)
  const [amount1, setAmount1] = useState(0)
  const [amount0Usd, setAmount0Usd] = useState(0)
  const [amount1Usd, setAmount1Usd] = useState(0)
  const [amount0Fees, setAmount0Fees] = useState(0.0)
  const [amount1Fees, setAmount1Fees] = useState(0.0)
  const [amount0FeesUsd, setAmount0FeesUsd] = useState(0.0)
  const [amount1FeesUsd, setAmount1FeesUsd] = useState(0.0)
  const [is0Copied, setIs0Copied] = useState(false)
  const [is1Copied, setIs1Copied] = useState(false)
  const [isPoolCopied, setIsPoolCopied] = useState(false)
  const [lowerInverse, setLowerInverse] = useState(0);
  const [upperInverse, setUpperInverse] = useState(0);
  const [priceInverse, setPriceInverse] = useState(0);
  const [tokenZeroDisplay, setTokenZeroDisplay] = useState(
    tokenIn.address != '' as string
      ? tokenIn.address.substring(0, 6) +
          '...' +
          tokenIn.address
            .substring(
              tokenIn.address.length - 4,
              tokenIn.address.length,
            )
      : undefined,
  )
  const [tokenOneDisplay, setTokenOneDisplay] = useState(
    tokenOut.address != '' as string
      ? tokenOut.address.substring(0, 6) +
          '...' +
          tokenOut.address
            .substring(
              tokenOut.address.length - 4,
              tokenOut.address.length,
            )
      : undefined,
  )
  const [poolDisplay, setPoolDisplay] = useState(
    rangePoolAddress != '' as string
      ? rangePoolAddress.substring(0, 6) +
          '...' +
          rangePoolAddress
            .substring(rangePoolAddress.length - 4, rangePoolAddress.length)
      : undefined,
  )

  ////////////////////////Addresses

  useEffect(() => {
    copyElementUseEffect(copyAddress0, setIs0Copied)
    copyElementUseEffect(copyAddress1, setIs1Copied)
    copyElementUseEffect(copyRangePoolAddress, setIsPoolCopied)
  }, [])

  function copyAddress0() {
    navigator.clipboard.writeText(tokenIn.address.toString())
    setIs0Copied(true)
  }

  function copyAddress1() {
    navigator.clipboard.writeText(tokenOut.address.toString())
    setIs1Copied(true)
  }

  function copyRangePoolAddress() {
    navigator.clipboard.writeText(rangePoolAddress.toString())
    setIsPoolCopied(true)
  }

  ////////////////////////Pool

  useEffect(() => {
    getRangePoolRatios()
  }, [
    amount0,
    amount1,
    amount0Fees,
    amount1Fees
  ])

  const getRangePoolRatios = () => {
    try {
      if (rangePoolData != undefined) {
        setAmount0Usd(
          parseFloat((amount0 * tokenInRangeUSDPrice).toPrecision(6)),
        )
        setAmount1Usd(
          parseFloat((amount1 * tokenOutRangeUSDPrice).toPrecision(6)),
        )
        setAmount0FeesUsd(
          parseFloat((amount0Fees * tokenInRangeUSDPrice).toPrecision(3)),
        )
        setAmount1FeesUsd(
          parseFloat((amount1Fees * tokenOutRangeUSDPrice).toPrecision(3)),
        )
        setLowerInverse(
          parseFloat((tokenOutRangeUSDPrice / parseFloat(upperPrice)).toPrecision(6)),
        )
        setUpperInverse(
          parseFloat((tokenOutRangeUSDPrice / parseFloat(lowerPrice)).toPrecision(6)),
        )
        setPriceInverse(
          parseFloat((tokenOutRangeUSDPrice / parseFloat(TickMath.getPriceStringAtSqrtPrice(JSBI.BigInt(String(rangePoolData.price))))).toPrecision(6))
        )
      }
    } catch (error) {
      console.log(error)
    }
  }

  ////////////////////////Liquidity

  useEffect(() => {
    if (rangePoolData.token0 && rangePoolData.token1) {
      if (tokenIn.address) {
        fetchRangeTokenUSDPrice(
          rangePoolData,
          tokenIn,
          setTokenInRangeUSDPrice
        );
      }
      if (tokenOut.address) {
        fetchRangeTokenUSDPrice(
          rangePoolData,
          tokenOut,
          setTokenOutRangeUSDPrice
        );
      }
    }
  }, []);

  useEffect(() => {
    setLowerPrice(TickMath.getPriceStringAtTick(Number(rangePositionData.min)))
    setUpperPrice(TickMath.getPriceStringAtTick(Number(rangePositionData.max)))
  }, [tokenInRangeUSDPrice, tokenOutRangeUSDPrice])

  useEffect(() => {
    setAmounts()
  }, [lowerPrice, upperPrice])

  function setAmounts() {
    try {
      console.log('rangePoolData.price', rangePoolData.price)
        console.log('rangePositionData.userLiquidity', rangePositionData.userLiquidity)
        console.log('lowerPrice', lowerPrice)
        console.log('upperPrice', upperPrice)

        console.log(!isNaN(parseFloat(lowerPrice)), 'nan check 1')
        console.log(!isNaN(parseFloat(upperPrice)), 'nan check 2')
        console.log(!isNaN(parseFloat(String(rangePoolData.price))), 'nan check 3')
        console.log(Number(rangePositionData.userLiquidity) > 0, 'liq check')
        console.log(parseFloat(lowerPrice) < parseFloat(upperPrice), 'price check')
      if (
        !isNaN(parseFloat(lowerPrice)) &&
        !isNaN(parseFloat(upperPrice)) &&
        !isNaN(parseFloat(String(rangePoolData.price))) &&
        Number(rangePositionData.userLiquidity) > 0 &&
        parseFloat(lowerPrice) < parseFloat(upperPrice)
      ) {


        const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(Number(rangePositionData.min))
        const upperSqrtPrice = TickMath.getSqrtRatioAtTick(Number(rangePositionData.max))
        const rangeSqrtPrice = JSBI.BigInt(rangePoolData.price)
        const liquidity = JSBI.BigInt(rangePositionData.userLiquidity)
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
    address: rangePoolAddress,
    abi: rangePoolABI,
    functionName: 'snapshot',
    args: [[address, rangePositionData.min, rangePositionData.max]],
    chainId: 421613,
    watch: true,
    enabled: isConnected && rangePoolAddress != '' as string,
    onSuccess(data) {
      setSnapshot(data)
      console.log('Success snapshot Range', data)
    },
    onError(error) {
      console.log('snapshot args', address, rangePositionData.min.toString(), rangePositionData.max.toString())
      console.log('Error snapshot Range', error)
    },
  })

  useEffect(() => {
    setFeesOwed()
  }, [snapshot])

  function setFeesOwed() {
    try {
      if (snapshot) {
        console.log('snapshot', snapshot.toString())
        const fees0 = parseFloat(ethers.utils.formatUnits(snapshot[2], 18))
        const fees1 = parseFloat(ethers.utils.formatUnits(snapshot[3], 18))
        console.log('fees owed 1', ethers.utils.formatUnits(snapshot[3], 18))
        setAmount0Fees(fees0)
        setAmount1Fees(fees1)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="bg-[url('/static/images/background.svg')] bg-no-repeat bg-cover min-h-screen font-Satoshi ">
      <Navbar />
      <div className="flex justify-center w-full text-white relative min-h-[calc(100vh-76px)] w-full px-5">
      <div className="w-full lg:w-[60rem] mt-[10vh] mb-[10vh]">
          <div className="flex flex-wrap justify-between items-center mb-2">
            <div className="text-left flex flex-wrap gap-y-5 items-center gap-x-5 py-2.5">
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
                {tokenIn.symbol}-{tokenOut.symbol}
              </span>
             <span className="bg-white text-black rounded-md px-3 py-0.5">
                {Number(rangePositionData.feeTier) / 10000}%
              </span>
              <div className="hidden md:block">
              {Number(rangePoolData.tickAtPrice) < Number(rangePositionData.min) ||
              Number(rangePoolData.tickAtPrice) > Number(rangePositionData.min) ? (
                <div className="pr-5">
                  <div className="flex items-center bg-black py-2 px-5 rounded-lg gap-x-2 text-sm whitespace-nowrap">
                    <ExclamationTriangleIcon className="w-4 text-yellow-600" />
                    Out of Range
                  </div>
                </div>
              ) : (
                <div className="flex items-center bg-black py-2 px-5 rounded-lg gap-x-2 text-sm whitespace-nowrap">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  In Range
                </div>
              )}
            </div>
            </div>

            <a
              href={'https://goerli.arbiscan.io/address/' + rangePoolAddress}
              target="_blank"
              rel="noreferrer"
              className="gap-x-2 flex items-center text-white cursor-pointer hover:opacity-80 whitespace-nowrap"
            >
              View on Arbiscan
              <ArrowTopRightOnSquareIcon className="w-5 " />
            </a>
          </div>
          <div className="mb-4">
            <div className="flex flex-wrap justify-between text-[#646464]">
              <div className="hidden md:grid grid-rows-2 md:grid-rows-1 grid-cols-1 md:grid-cols-2 gap-x-10 md:pl-2 pl-0 ">
                <h1
                  onClick={() => copyAddress0()}
                  className="text-xs cursor-pointer w-32"
                >
                  {tokenIn.symbol}:
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
                  {tokenOut.symbol}:
                  {is1Copied ? (
                    <span className="ml-1">Copied</span>
                  ) : (
                    <span className="ml-1">{tokenOneDisplay}</span>
                  )}
                </h1>
              </div>
              <h1
                onClick={() => copyRangePoolAddress()}
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
          <div className="bg-black  border border-grey2 border-b-none w-full rounded-xl py-6 px-7 overflow-y-auto">
            <div className="flex md:flex-row flex-col gap-x-20 justify-between">
              <div className="md:w-1/2">
                <h1 className="text-lg mb-3">Liquidity</h1>
                <span className="text-4xl">${userLiquidityUsd.toFixed(2)}</span>
                <div className="text-grey mt-3 space-y-2">
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="flex items-center gap-x-4">
                      <img height="30" width="30" src={tokenIn.logoURI} />
                      {tokenIn.symbol}
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
                      {tokenOut.symbol}
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
              <div className="md:w-1/2 mt-10 md:mt-0">
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
                      {tokenIn.symbol}
                    </div>
                    <span>{amount0Fees.toPrecision(4)}</span>
                  </div>
                  <div className="flex items-center justify-between border border-grey1 py-3 px-4 rounded-xl">
                    <div className="flex items-center gap-x-4">
                      <img height="30" width="30" src={tokenOut.logoURI} />
                      {tokenOut.symbol}
                    </div>
                    <span>{amount1Fees.toPrecision(4)}</span>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <div className="space-y-3">
                    <RangeCompoundButton
                      poolAddress={rangePoolAddress.toString()}
                      address={address}
                      lower={BigNumber.from(rangePositionData.min)}
                      upper={BigNumber.from(rangePositionData.max)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-7">
              <div className="flex gap-x-6 items-center">
                <h1 className="text-lg">Price Range </h1>
                {Number(rangePoolData.tickAtPrice) < Number(rangePositionData.min) ||
                Number(rangePoolData.tickAtPrice) >= Number(rangePositionData.max) ? (
                  <div className="pr-5">
                    <div className="flex items-center bg-black py-2 px-5 rounded-lg gap-x-2 text-sm whitespace-nowrap">
                      <ExclamationTriangleIcon className="w-4 text-yellow-600" />
                      Out of Range
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center bg-black py-2 px-5 rounded-lg gap-x-2 text-sm whitespace-nowrap">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    In Range
                  </div>
                )}
              </div>
              <button onClick={() => setPriceDirection(!priceDirection)} className="text-grey text-xs bg-dark border border-grey1 cursor-pointer px-4 py-1 rounded-md whitespace-nowrap text-xs text-grey flex items-center gap-x-2">{priceDirection ? <>{tokenIn.symbol}</> : <>{tokenOut.symbol}</>} per {priceDirection ? <>{tokenOut.symbol}</> : <>{tokenIn.symbol}</>} <ArrowsRightLeftIcon className="w-4 text-white" /></button>
            </div>
            <div className="flex justify-between items-center mt-4 md:gap-x-6 gap-x-3">
              <div className="border border-grey1 rounded-xl py-2 text-center w-full">
                <div className="text-grey md:text-xs text-[10px] w-full">Min. Price</div>
                <div className="text-white text-2xl my-2 w-full">
                {priceDirection ? <>{lowerInverse}</> : <>{lowerPrice}</>}
                </div>
                <div className="text-grey md:text-xs text-[10px] w-full">
                {priceDirection ? <>{tokenIn.symbol}</> : <>{tokenOut.symbol}</>} per {priceDirection ? <>{tokenOut.symbol}</> : <>{tokenIn.symbol}</>}
                </div>
                <div className="text-grey text-[10px] md:text-xs w-full italic mt-1">
                  Your position will be 100% {priceDirection ? tokenOut.symbol : tokenIn.symbol} at this price.
                </div>
              </div>
              <ArrowsRightLeftIcon className="w-12 text-grey" />
              <div className="border border-grey1 rounded-xl py-2 text-center w-full">
                <div className="text-grey md:text-xs text-[10px] w-full">Max. Price</div>
                <div className="text-white text-2xl my-2 w-full">
                {priceDirection ? <>{upperInverse}</> : <>{upperPrice}</>}
                </div>
                <div className="text-grey md:text-xs text-[10px] w-full">
                {priceDirection ? <>{tokenIn.symbol}</> : <>{tokenOut.symbol}</>} per {priceDirection ? <>{tokenOut.symbol}</> : <>{tokenIn.symbol}</>}
                </div>
                <div className="text-grey text-[10px] md:text-xs w-full italic mt-1">
                  Your position will be 100% {priceDirection ? tokenIn.symbol : tokenOut.symbol} at this price.
                </div>
              </div>
            </div>
            <div className="border border-grey1 rounded-xl py-2 text-center w-full mt-4 bg-dark">
              <div className="text-grey text-xs w-full">Current Price</div>
              <div className="text-white text-2xl my-2 w-full">
                {rangePositionData.price != undefined &&
                 priceDirection ?
                 priceInverse : TickMath.getPriceStringAtSqrtPrice(JSBI.BigInt(rangePositionData.price))
                }
              </div>
              <div className="text-grey text-xs w-full">
              {priceDirection ? <>{tokenIn.symbol}</> : <>{tokenOut.symbol}</>} per {priceDirection ? <>{tokenOut.symbol}</> : <>{tokenIn.symbol}</>}
              </div>
            </div>
          </div>
        </div>
      </div>
      <RemoveLiquidity
        isOpen={isRemoveOpen}
        setIsOpen={setIsRemoveOpen}
        address={address}
      />
      <AddLiquidity
        isOpen={isAddOpen}
        setIsOpen={setIsAddOpen}
        address={address}
      />
    </div>
  )
}
