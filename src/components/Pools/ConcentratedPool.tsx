import { Fragment, useEffect, useState } from 'react'
import {
  ChevronDownIcon,
  PlusIcon,
  MinusIcon,
  ArrowLongRightIcon,
  InformationCircleIcon,
} from '@heroicons/react/20/solid'
import { Listbox, Transition } from '@headlessui/react'
import SelectToken from '../SelectToken'
import ConcentratedPoolPreview from './ConcentratedPoolPreview'
import { useRangeStore } from '../../hooks/useStore'
import { TickMath, invertPrice, roundTick } from '../../utils/math/tickMath'
import JSBI from 'jsbi'
import { getRangePoolFromFactory } from '../../utils/queries'
import useInputBox from '../../hooks/useInputBox'
import { erc20ABI, useAccount } from 'wagmi'
import { BigNumber, ethers } from 'ethers'
import { useContractRead } from 'wagmi'
import { getBalances } from '../../utils/balances'
import { BN_ZERO, ZERO, ZERO_ADDRESS } from '../../utils/math/constants'
import { DyDxMath } from '../../utils/math/dydxMath'
import inputFilter from '../../utils/inputFilter'
import TickSpacing from '../Tooltips/TickSpacing'
import { token } from '../../utils/types'
import { switchDirection } from '../../utils/tokens'

export default function ConcentratedPool({
  account,
  poolId,
  tokenOneName,
  tokenOneSymbol,
  tokenOneLogoURI,
  tokenOneAddress,
  tokenZeroName,
  tokenZeroSymbol,
  tokenZeroLogoURI,
  tokenZeroAddress,
  minLimit,
  maxLimit,
  liquidity,
  tickSpacingParam,
  feeTier,
}) {
  const feeTiers = [
    {
      id: 1,
      tier: '0.01%',
      tierId: 100,
      text: 'Best for very stable pairs',
      unavailable: false,
    },
    {
      id: 2,
      tier: '0.05%',
      tierId: 500,
      text: 'Best for stable pairs',
      unavailable: false,
    },
    {
      id: 3,
      tier: '0.3%',
      tierId: 300,
      text: 'Best for most pairs',
      unavailable: false,
    },
    {
      id: 4,
      tier: '1%',
      tierId: 1000,
      text: 'Best for exotic pairs',
      unavailable: false,
    },
  ]
  const { address, isConnected, isDisconnected } = useAccount()
  const [tokenIn, setTokenIn] = useState({
    symbol: tokenZeroSymbol ?? 'TOKEN20B',
    logoURI: tokenZeroLogoURI ?? '/static/images/eth_icon.png',
    address: tokenZeroAddress ?? '0x6774be1a283Faed7ED8e40463c40Fb33A8da3461',
  } as token)
  const [tokenOut, setTokenOut] = useState({
    symbol: tokenOneSymbol ?? 'TOKEN20A',
    logoURI: tokenOneLogoURI ?? '/static/images/token.png',
    address: tokenOneAddress ?? '0xC26906E10E8BDaDeb2cf297eb56DF59775eE52c4',
  } as token)
  const {
    bnInput,
    inputBox,
    maxBalance,
    bnInputLimit,
    LimitInputBox,
  } = useInputBox()
  const [
    updateRangeContractParams,
    updateRangeAllowance,
    RangeAllowance,
    rangeContractParams,
  ] = useRangeStore((state: any) => [
    state.updateRangeContractParams,
    state.updateRangeAllowance,
    state.RangeAllowance,
    state.rangeContractParams,
  ])
  const [tokenOrder, setTokenOrder] = useState(true)
  /* const [selected, setSelected] = useState(updateSelected()) */
  const [selected, setSelected] = useState(updateSelected)
  const [queryTokenIn, setQueryTokenIn] = useState(tokenZeroAddress)
  const [queryTokenOut, setQueryTokenOut] = useState(tokenOneAddress)
  const [balance0, setBalance0] = useState('')
  const [balance1, setBalance1] = useState('')
  const [allowance0, setAllowance0] = useState(BN_ZERO)
  const [allowance1, setAllowance1] = useState(BN_ZERO)
  const [rangePrice, setRangePrice] = useState(undefined)
  const [rangeTickPrice, setRangeTickPrice] = useState(undefined)
  const [rangeSqrtPrice, setRangeSqrtPrice] = useState(undefined)
  const [rangePoolRoute, setRangePoolRoute] = useState(undefined)

  const initialBig = BigNumber.from(0)
  const [to, setTo] = useState('')
  const [lowerPrice, setLowerPrice] = useState('')
  const [upperPrice, setUpperPrice] = useState('')
  const [lowerTick, setLowerTick] = useState(initialBig)
  const [upperTick, setUpperTick] = useState(initialBig)
  const [amount0, setAmount0] = useState(initialBig)
  const [amount1, setAmount1] = useState(initialBig)
  const [amount0Usd, setAmount0Usd] = useState(0.0)
  const [amount1Usd, setAmount1Usd] = useState(0.0)
  const [tickSpacing, setTickSpacing] = useState(tickSpacingParam)
  const [hasSelected, setHasSelected] = useState(true)
  const [isDisabled, setDisabled] = useState(true)
  const [usdPrice0, setUsdPrice0] = useState(0)
  const [usdPrice1, setUsdPrice1] = useState(0)
  const [showTooltip, setShowTooltip] = useState(false)
  const [fetchDelay, setFetchDelay] = useState(false)

  useEffect(() => {
    if (!fetchDelay) {
      updateBalances()
      updatePool()
      setFetchDelay(true)
    } else {
      const interval = setInterval(() => {
        updateBalances()
        updatePool()
      }, 5000)
      return () => clearInterval(interval)
    }
  })

  async function updateBalances() {
    await getBalances(
      address,
      hasSelected,
      tokenIn,
      tokenOut,
      setBalance0,
      setBalance1,
    )
  }

  async function updatePool() {
    await getRangePoolData()
  }

  useEffect(() => {
    fetchTokenPrice()
  }, [usdPrice0, usdPrice1, amount0, amount1])

  useEffect(() => {
    setRangeParams()
  }, [address, amount0, amount1])

  useEffect(() => {
    setAmounts()
  }, [bnInput])

  const { data: allowanceIn } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, rangePoolRoute],
    chainId: 421613,
    watch: true,
    enabled: rangePoolRoute != undefined && tokenIn.address != '',
    onSuccess(data) {
      // console.log('Success allowance in', allowanceIn.toString())
    },
    onError(error) {
      console.log('Error', error)
    },
  })

  const { data: allowanceOut } = useContractRead({
    address: tokenOut.address,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, rangePoolRoute],
    chainId: 421613,
    watch: true,
    enabled: rangePoolRoute != undefined && tokenIn.address != '',
    onSuccess(data) {
      // console.log('Success allowance out', allowanceOut.toString())
    },
    onError(error) {
      console.log('Error', error)
    },
    onSettled(data, error) {
      // console.log('Allowance Settled', { data, error, rangePoolRoute, tokenIn, tokenOut })
    },
  })

  useEffect(() => {
    if (allowanceIn) {
      console.log('token in allowance', allowanceIn.toString(), !allowanceIn.eq(tokenOrder ? allowance0 : allowance1))
      if (
        address != '0x' &&
        !allowanceIn.eq(tokenOrder ? allowance0 : allowance1)
      )
        tokenOrder ? setAllowance0(allowanceIn) : setAllowance1(allowanceIn)
    }
  }), [allowanceIn]

  useEffect(() => {
    if (allowanceOut) {
      if (
        address != '0x' &&
        !allowanceOut.eq(tokenOrder ? allowance1 : allowance0)
      )
        tokenOrder ? setAllowance1(allowanceOut) : setAllowance0(allowanceOut)
    }
  }), [allowanceOut]

  function updateSelected(): any {
    const tier = feeTiers[0]
    if (feeTier == 0.01) {
      return feeTiers[0]
    } else if (feeTier == 0.05) {
      return feeTiers[1]
    } else if (feeTier == 0.3) {
      return feeTiers[2]
    } else if (feeTier == 1) {
      return feeTiers[3]
    } else return feeTiers[0]
  }

  useEffect(() => {
    if (!isNaN(parseFloat(lowerPrice))) {
      console.log('setting lower tick')
      setLowerTick(
        BigNumber.from(TickMath.getTickAtPriceString(lowerPrice, tickSpacing)),
      )
    }
    if (!isNaN(parseFloat(upperPrice))) {
      console.log('setting upper tick')
      setUpperTick(
        BigNumber.from(TickMath.getTickAtPriceString(upperPrice, tickSpacing)),
      )
    }
    setAmounts()
  }, [lowerPrice, upperPrice])

  const getRangePoolData = async () => {
    try {
      if (hasSelected === true) {
        console.log('tier selected', selected.tierId)
        const pool = tokenOrder
          ? await getRangePoolFromFactory(
              tokenIn.address,
              tokenOut.address,
              selected.tierId,
            )
          : await getRangePoolFromFactory(
              tokenOut.address,
              tokenIn.address,
              selected.tierId,
            )
        const dataLength = pool['data']['rangePools'].length
        console.log('data length check', dataLength)
        if (dataLength != 0) {
          const id = pool['data']['rangePools']['0']['id']
          const price = JSBI.BigInt(pool['data']['rangePools']['0']['price'])
          const spacing =
            pool['data']['rangePools']['0']['feeTier']['tickSpacing']
          const tickAtPrice = pool['data']['rangePools']['0']['tickAtPrice']
          const token0Price =
            pool['data']['rangePools']['0']['token0']['usdPrice']
          const token1Price =
            pool['data']['rangePools']['0']['token1']['usdPrice']
          setRangePoolRoute(id)
          setRangePrice(TickMath.getPriceStringAtSqrtPrice(price))
          setRangeSqrtPrice(price)
          if (isNaN(parseFloat(lowerPrice)) || parseFloat(lowerPrice) <= 0) {
            setLowerPrice(TickMath.getPriceStringAtTick(tickAtPrice - 7000))
            setLowerTick(BigNumber.from(tickAtPrice - 7000))
          }
          if (isNaN(parseFloat(upperPrice)) || parseFloat(upperPrice) <= 0) {
            setUpperPrice(TickMath.getPriceStringAtTick(tickAtPrice - -7000))
            setUpperTick(BigNumber.from(tickAtPrice - -7000))
          }
          setTickSpacing(spacing)
          setUsdPrice0(parseFloat(token0Price))
          setUsdPrice1(parseFloat(token1Price))
          setRangeTickPrice(tickAtPrice)
        } else {
          setRangePoolRoute(ZERO_ADDRESS)
          setRangePrice('1.00')
          setRangeSqrtPrice(TickMath.getSqrtRatioAtTick(0))
          console.log('range price set', rangePrice)
        }
      } else {
        await getRangePoolFromFactory()
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchTokenPrice = async () => {
    try {
      const token0Amount = parseFloat(ethers.utils.formatUnits(amount0, 18))
      const token1Amount = parseFloat(ethers.utils.formatUnits(amount1, 18))
      setAmount0Usd(token0Amount * usdPrice0)
      setAmount1Usd(token1Amount * usdPrice1)
      console.log('setting usd prices for amounts', token0Amount * usdPrice0, token1Amount * usdPrice1)
    } catch (error) {
      console.log(error)
    }
  }

  function setAmounts() {
    try {
      if (
        !isNaN(parseFloat(lowerPrice)) &&
        !isNaN(parseFloat(upperPrice)) &&
        !isNaN(parseFloat(rangePrice)) &&
        Number(ethers.utils.formatUnits(bnInput)) !== 0 &&
        hasSelected == true &&
        parseFloat(lowerPrice) < parseFloat(upperPrice)
      ) {
        const lower = TickMath.getTickAtPriceString(lowerPrice, tickSpacing)
        const upper = TickMath.getTickAtPriceString(upperPrice, tickSpacing)
        setTo(address)
        setLowerTick(BigNumber.from(lower))
        setUpperTick(BigNumber.from(upper))
        const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(Number(lower))
        const upperSqrtPrice = TickMath.getSqrtRatioAtTick(Number(upper))
        const liquidity =
          parseFloat(rangePrice) >= parseFloat(lowerPrice) &&
          parseFloat(rangePrice) <= parseFloat(upperPrice)
            ? DyDxMath.getLiquidityForAmounts(
                tokenOrder ? rangeSqrtPrice : lowerSqrtPrice,
                tokenOrder ? upperSqrtPrice : rangeSqrtPrice,
                rangeSqrtPrice,
                tokenOrder ? BN_ZERO : bnInput,
                tokenOrder ? bnInput : BN_ZERO,
              )
            : DyDxMath.getLiquidityForAmounts(
                lowerSqrtPrice,
                upperSqrtPrice,
                rangeSqrtPrice,
                tokenOrder ? BN_ZERO : bnInput,
                tokenOrder ? bnInput : BN_ZERO,
              )
        const tokenOutAmount = JSBI.greaterThan(liquidity, ZERO)
          ? tokenOrder
            ? DyDxMath.getDy(liquidity, lowerSqrtPrice, rangeSqrtPrice, true)
            : DyDxMath.getDx(liquidity, rangeSqrtPrice, upperSqrtPrice, true)
          : ZERO
        // set amount based on bnInput
        tokenOrder ? setAmount0(bnInput) : setAmount1(bnInput)
        // set amount based on liquidity math
        tokenOrder
          ? setAmount1(BigNumber.from(String(tokenOutAmount)))
          : setAmount0(BigNumber.from(String(tokenOutAmount)))
      } else {
        tokenOrder ? setAmount1(BN_ZERO) : setAmount0(BN_ZERO)
        setDisabled(true)
      }
    } catch (error) {
      console.log(error)
    }
  }

  function setRangeParams() {
    try {
      if (
        !isNaN(parseFloat(lowerPrice)) &&
        !isNaN(parseFloat(upperPrice)) &&
        Number(ethers.utils.formatUnits(bnInput)) !== 0 &&
        hasSelected == true &&
        (amount0.gt(BN_ZERO) || amount1.gt(BN_ZERO))
      ) {
        updateRangeContractParams({
          to: address,
          min: lowerTick,
          max: upperTick,
          amount0: amount0,
          amount1: amount1,
          fungible: true,
        })
        setDisabled(false)
      } else {
        setDisabled(true)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const changePrice = (direction: string, inputId: string) => {
    if (!tickSpacing) return
    const currentTick =
      inputId == 'minInput' || inputId == 'maxInput'
        ? inputId == 'minInput'
          ? Number(lowerTick)
          : Number(upperTick)
        : rangeTickPrice
    if (!currentTick) return
    const increment = tickSpacing
    const adjustment =
      direction == 'plus' || direction == 'minus'
        ? direction == 'plus'
          ? -increment
          : increment
        : 0
    const newTick = roundTick(currentTick - adjustment, increment)
    const newPriceString = TickMath.getPriceStringAtTick(newTick)
    ;(document.getElementById(inputId) as HTMLInputElement).value = Number(
      newPriceString,
    ).toFixed(6)
    if (inputId === 'maxInput') {
      setUpperTick(BigNumber.from(newTick))
      setUpperPrice(newPriceString)
    }
    if (inputId === 'minInput') {
      setLowerTick(BigNumber.from(newTick))
      setLowerPrice(newPriceString)
    }
  }

  function SelectFee() {
    return (
      <Listbox value={selected} onChange={setSelected}>
        <div className="relative mt-1 w-full">
          <Listbox.Button className="relative cursor-default rounded-lg bg-black text-white cursor-pointer border border-grey1 py-2 pl-3 w-full text-left shadow-md focus:outline-none">
            <span className="block truncate">{selected.tier}</span>
            <span className="block truncate text-xs text-grey mt-1">
              {selected.text}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDownIcon className="w-7 text-grey" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-black border border-grey1 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {feeTiers.map((feeTierz, feeTierIdx) => (
                <Listbox.Option
                  key={feeTierIdx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 px-4 cursor-pointer ${
                      active ? 'opacity-80 bg-dark' : 'opacity-100'
                    }`
                  }
                  value={feeTierz}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate text-white ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {feeTierz.tier}
                      </span>
                      <span
                        className={`block truncate text-grey text-xs mt-1 ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {feeTierz.text}
                      </span>
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    )
  }

  return (
    <div className="bg-black flex gap-x-20 justify-between border border-grey2 w-full rounded-t-xl py-6 px-7 h-[70vh]">
      <div className="w-1/2">
        <div>
          <div className="flex items-center gap-x-4">
            <h1>Select Pair</h1>
          </div>
          <div className="flex items-center gap-x-5 mt-3">
            <SelectToken
              index="0"
              type="in"
              selected={hasSelected}
              setHasSelected={setHasSelected}
              tokenIn={tokenIn}
              setTokenIn={setTokenIn}
              tokenOut={tokenOut}
              setTokenOut={setTokenOut}
              displayToken={tokenIn}
              balance={setQueryTokenIn}
              key={queryTokenIn}
            />
            <ArrowLongRightIcon
              className="w-6 cursor-pointer"
              onClick={() => {
                if (hasSelected) {
                  switchDirection(
                    tokenOrder,
                    setTokenOrder,
                    tokenIn,
                    setTokenIn,
                    tokenOut,
                    setTokenOut,
                    queryTokenIn,
                    setQueryTokenIn,
                    queryTokenOut,
                    setQueryTokenOut,
                  )
                }
              }}
            />
            <SelectToken
              type="out"
              selected={hasSelected}
              setHasSelected={setHasSelected}
              tokenIn={tokenIn}
              setTokenIn={setTokenIn}
              tokenOut={tokenOut}
              setTokenOut={setTokenOut}
              displayToken={tokenOut}
              balance={setQueryTokenOut}
              key={queryTokenOut}
            />
          </div>
        </div>
        <div>
          <div className="gap-x-4 mt-8">
            <h1>Fee tier</h1>
          </div>
          <div className="mt-3">
            <SelectFee />
          </div>
        </div>
        <div>
          <div className="gap-x-4 mt-8">
            <h1>Deposit amounts</h1>
          </div>
          <div className="mt-3 space-y-3">
            <div className="w-full items-center justify-between flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
              <div className=" p-2 w-20">
                {inputBox('0')}
                {
                  <div className="flex">
                    <div className="flex text-xs text-[#4C4C4C]">
                      $
                      {(
                        (tokenOrder ? usdPrice0 : usdPrice1) *
                        Number(ethers.utils.formatUnits(bnInput, 18))
                      ).toFixed(2)}
                    </div>
                  </div>
                }
              </div>
              <div className="">
                <div className=" ml-auto">
                  <div>
                    <div className="flex justify-end">
                      <button className="flex items-center gap-x-3 bg-black border border-grey1 px-3 py-1.5 rounded-xl">
                        <img className="w-7" src={tokenIn.logoURI} />
                        {tokenIn.symbol}
                      </button>
                    </div>
                    <div className="flex items-center justify-end gap-2 px-1 mt-2">
                      <div className="flex text-xs text-[#4C4C4C]">
                        Balance: {balance0 === 'NaN' ? 0 : balance0}
                      </div>
                      <button
                        className="flex text-xs uppercase text-[#C9C9C9]"
                        onClick={() => maxBalance(balance0, '0')}
                      >
                        Max
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full items-center justify-between flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
              <div className=" p-2 ">
                {Number(
                  tokenOrder
                    ? parseFloat(ethers.utils.formatUnits(amount1, 18)).toFixed(2)
                    : parseFloat(ethers.utils.formatUnits(amount0, 18)).toFixed(2),
                )}
              </div>
              <div className="">
                <div className=" ml-auto">
                  <div>
                    <div className="flex justify-end">
                      <button className="flex items-center gap-x-3 bg-black border border-grey1 px-3 py-1.5 rounded-xl ">
                        <div className="flex items-center gap-x-2 w-full">
                          <img className="w-7" src={tokenOut.logoURI} />
                          {tokenOut.symbol}
                        </div>
                      </button>
                    </div>
                    <div className="flex items-center justify-end gap-x-2 px-1 mt-2">
                      <div className="flex text-xs text-[#4C4C4C]">
                        Balance: {balance1 === 'NaN' ? 0 : balance1}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-1/2">
        <div>
          <div className="flex justify-between items-center">
            <div className="flex items-center w-full mb-3 mt-4 gap-x-2 relative">
              <h1 className="">Set Price Range</h1>
              <InformationCircleIcon
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="w-5 h-5 mt-[1px] text-grey cursor-pointer"
              />
              <div
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="absolute mt-32 pt-8"
              >
                {showTooltip ? <TickSpacing /> : null}
              </div>
            </div>
            <button
              className="text-grey text-xs bg-dark border border-grey1 px-4 py-1 rounded-md"
              onClick={() => {
                setLowerTick(BigNumber.from(roundTick(-887272, tickSpacing)))
                setUpperTick(BigNumber.from(roundTick(887272, tickSpacing)))
                setLowerPrice(TickMath.getPriceStringAtTick(roundTick(-887272, tickSpacing)))
                setUpperPrice(TickMath.getPriceStringAtTick(roundTick(887272, tickSpacing)))
              }}
            >
              Full Range
            </button>
          </div>
          <div className="flex flex-col mt-6 gap-y-5 w-full">
            <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
              <span className="text-xs text-grey">Min. Price</span>
              <div className="flex justify-center items-center">
                <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
                  <button onClick={() => changePrice('minus', 'minInput')}>
                    <MinusIcon className="w-5 h-5 ml-[2.5px]" />
                  </button>
                </div>
                <input
                  autoComplete="off"
                  className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
                  placeholder="0"
                  id="minInput"
                  type="text"
                  value={
                    lowerPrice.toString().includes('e')
                      ? parseFloat(lowerPrice).toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        }).length > 6
                        ? '0'
                        : parseFloat(lowerPrice).toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })
                      : lowerPrice
                  }
                  onChange={() =>
                    setLowerPrice(
                      inputFilter(
                        (document.getElementById(
                          'minInput',
                        ) as HTMLInputElement)?.value,
                      ),
                    )
                  }
                />
                <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
                  <button onClick={() => changePrice('plus', 'minInput')}>
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
              <span className="text-xs text-grey">Max. Price</span>
              <div className="flex justify-center items-center">
                <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
                  <button onClick={() => changePrice('minus', 'maxInput')}>
                    <MinusIcon className="w-5 h-5 ml-[2.5px]" />
                  </button>
                </div>
                <input
                  autoComplete="off"
                  className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
                  placeholder="0"
                  id="maxInput"
                  type="text"
                  value={
                    upperPrice.toString().includes('e')
                      ? Number(upperPrice).toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        }).length > 6
                        ? '∞'
                        : Number(upperPrice).toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })
                      : upperPrice
                  }
                  onChange={() =>
                    setUpperPrice(
                      inputFilter(
                        (document.getElementById(
                          'maxInput',
                        ) as HTMLInputElement)?.value,
                      ),
                    )
                  }
                />
                <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
                  <button onClick={() => changePrice('plus', 'maxInput')}>
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ConcentratedPoolPreview
          account={to}
          key={poolId}
          poolAddress={poolId}
          tokenIn={tokenIn}
          tokenOut={tokenOut}
          amount0={amount0}
          amount1={amount1}
          amount0Usd={amount0Usd}
          amount1Usd={amount1Usd}
          lowerTick={lowerTick}
          upperTick={upperTick}
          fee={selected.tier}
          allowance0={allowance0}
          allowance1={allowance1}
          disabled={isDisabled}
        />
      </div>
    </div>
  )
}
