import { Fragment, useEffect, useState } from 'react'
import {
  ChevronDownIcon,
  PlusIcon,
  MinusIcon,
  ArrowLongRightIcon,
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
import { rangePoolABI } from '../../abis/evm/rangePool'
import { getBalances } from '../../utils/balances'
import { getRangePool } from '../../utils/pools'
import { BN_ZERO, ZERO, ZERO_ADDRESS } from '../../utils/math/constants'
import { DyDxMath } from '../../utils/math/dydxMath'

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
  type token = {
    symbol: string
    logoURI: string
    address: string
  }
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
    { id: 3, tier: '0.3%', tierId: 300, text: 'Best for most pairs', unavailable: false },
    { id: 4, tier: '1%', tierId: 1000, text: 'Best for exotic pairs', unavailable: false },
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

  const [feeControler, setFeeControler] = useState(false)
  const [selected, setSelected] = useState(feeTiers[0])
  const [queryTokenIn, setQueryTokenIn] = useState(tokenZeroAddress)
  const [queryTokenOut, setQueryTokenOut] = useState(tokenOneAddress)
  const [balance0, setBalance0] = useState('')
  const [balance1, setBalance1] = useState('0.00')
  const [tokenInAllowance, setTokenInAllowance] = useState(0)
  const [tokenOutAllowance, setTokenOutAllowance] = useState(0)
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
  const [tickSpacing, setTickSpacing] = useState(tickSpacingParam)
  const [hasSelected, setHasSelected] = useState(true)
  const [isDisabled, setDisabled] = useState(true)
  const [mktRate, setMktRate] = useState({})

  useEffect(() => {
    if (hasSelected) {
      updateBalances()
      updatePool()
    }
  }, [tokenOut.address, tokenIn.address, hasSelected])

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
  }, [rangePrice, tokenIn, tokenOut])

  useEffect(() => {
    setRangeParams()
  }, [address, amount0, amount1])

  useEffect(() => {
    setAmounts()
  }, [bnInput, lowerPrice, upperPrice])

  const { data: allowanceIn } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, rangePoolRoute],
    chainId: 421613,
    watch: true,
    enabled: rangePoolRoute != undefined && tokenIn.address != '',
    onSuccess(data) {
      setTokenInAllowance(Number(allowanceIn))
      // console.log('Success')
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
      setTokenOutAllowance(Number(allowanceOut))
      // console.log('Success')
    },
    onError(error) {
      console.log('Error', error)
    },
    onSettled(data, error) {
      // console.log('Allowance Settled', { data, error, rangePoolRoute, tokenIn, tokenOut })
    },
  })

  useEffect(() => {
    if (!isNaN(parseFloat(lowerPrice)) && !isNaN(parseFloat(upperPrice))) {
      console.log('setting lower tick')
      setLowerTick(BigNumber.from(TickMath.getTickAtPriceString(lowerPrice, tickSpacing)))
    }
    if (!isNaN(parseFloat(upperPrice))) {
      console.log('setting upper tick')
      setUpperTick(BigNumber.from(TickMath.getTickAtPriceString(upperPrice, tickSpacing)))
    }
  }, [lowerPrice, upperPrice])

  useEffect(() => {
    if (tokenInAllowance) {
      //console.log('token in allowance', tokenInAllowance, tokenInAllowance.toString(), allowance0)
      if(address != '0x' &&
          tokenInAllowance != Number(tokenOrder ? allowance0 : allowance1))
        tokenOrder ?
          setAllowance0(allowanceOut)
        : setAllowance1(allowanceOut)
        // console.log('token in allowance set', tokenInAllowance)
    }
  }), [tokenInAllowance]

  useEffect(() => {
    if (tokenOutAllowance) {
      if (address != '0x' &&
          tokenInAllowance != Number(tokenOrder ? allowance0 : allowance1))
        tokenOrder ?
            setAllowance1(allowanceIn)
          : setAllowance0(allowanceIn)
      // console.log('token out allowance set', tokenOutAllowance)
    }
  }), [tokenOutAllowance]

  if (feeTier != undefined && feeControler == false) {
    if (feeTier == 0.01) {
      setSelected(feeTiers[0])
    } else if (feeTier == 0.05) {
      setSelected(feeTiers[1])
    } else if (feeTier == 0.3) {
      setSelected(feeTiers[2])
    } else if (feeTier == 1) {
      setSelected(feeTiers[3])
    }
    if (minLimit != undefined) {
      setLowerPrice(minLimit)
    }
    if (maxLimit != undefined) {
      setUpperPrice(maxLimit)
    }
    setFeeControler(true)
  }

  function switchDirection() {
    setTokenOrder(!tokenOrder)
    const temp = tokenIn
    setTokenIn(tokenOut)
    setTokenOut(temp)
    const tempBal = queryTokenIn
    setQueryTokenIn(queryTokenOut)
    setQueryTokenOut(tempBal)
  }

  const getRangePoolData = async () => {
    try {
      if (hasSelected === true) {
        console.log('tier selected', selected.tierId)
        const pool = tokenOrder ? await getRangePoolFromFactory(tokenIn.address, tokenOut.address, selected.tierId)
                                : await getRangePoolFromFactory(tokenOut.address, tokenIn.address, selected.tierId)
        const dataLength = pool['data']['rangePools'].length
        console.log('data length check', dataLength)
        if (dataLength != 0 ){
          const id = pool['data']['rangePools']['0']['id']
          const price = JSBI.BigInt(pool['data']['rangePools']['0']['price'])
          const spacing = pool['data']['rangePools']['0']['feeTier']['tickSpacing']
          const tickAtPrice = pool['data']['rangePools']['0']['tickAtPrice']
          setRangePoolRoute(id)
          setRangePrice(TickMath.getPriceStringAtSqrtPrice(price))
          setRangeSqrtPrice(price)
          if (isNaN(parseFloat(lowerPrice)) || 
               parseFloat(lowerPrice) <= 0) {
            setLowerPrice(TickMath.getPriceStringAtTick(tickAtPrice - 7000))
            setLowerTick(BigNumber.from(tickAtPrice - 7000))
          }
          if (isNaN(parseFloat(upperPrice)) || 
               parseFloat(upperPrice) <= 0) {
            setUpperPrice(TickMath.getPriceStringAtTick(tickAtPrice - (-7000)))
            setUpperTick(BigNumber.from(tickAtPrice - (-7000)))
          }
          setTickSpacing(spacing)
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
    if (isNaN(parseFloat(rangePrice))) return
    try {
      console.log('fetchTokenPrice', String(rangePrice))
      const price0 = rangePrice
      const price1: any = invertPrice(rangePrice, false)
      setMktRate({
        TOKEN20A:
          price1.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          }),
        TOKEN20B: price0.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        }),
      })
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
        const liquidity = parseFloat(rangePrice) >= parseFloat(lowerPrice) &&
                          parseFloat(rangePrice) <= parseFloat(upperPrice) ?
                             DyDxMath.getLiquidityForAmounts(
                              tokenOrder ? rangeSqrtPrice : lowerSqrtPrice,
                              tokenOrder ? upperSqrtPrice : rangeSqrtPrice,
                              rangeSqrtPrice,
                              tokenOrder ? BN_ZERO : bnInput,
                              tokenOrder ? bnInput : BN_ZERO
                            )
                          : DyDxMath.getLiquidityForAmounts(
                            lowerSqrtPrice,
                            upperSqrtPrice,
                            rangeSqrtPrice,
                            tokenOrder ? BN_ZERO : bnInput,
                            tokenOrder ? bnInput : BN_ZERO
                          )
        const tokenOutAmount = JSBI.greaterThan(liquidity, ZERO) ?
                                  tokenOrder ? DyDxMath.getDy(liquidity, lowerSqrtPrice, rangeSqrtPrice, true)
                                             : DyDxMath.getDx(liquidity, rangeSqrtPrice, upperSqrtPrice, true)
                                : ZERO
        // set amount based on bnInput
        tokenOrder ? setAmount0(bnInput) : setAmount1(bnInput)
        // set amount based on liquidity math
        tokenOrder ? setAmount1(BigNumber.from(String(tokenOutAmount))) 
                   : setAmount0(BigNumber.from(String(tokenOutAmount)))
      } else {
        tokenOrder ? setAmount1(BN_ZERO) 
                   : setAmount0(BN_ZERO)
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
        (amount0.gt(BN_ZERO)  || amount1.gt(BN_ZERO))
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
    const currentTick = inputId == 'minInput' || inputId == 'maxInput' ?
                          (inputId == 'minInput' ? Number(lowerTick) : Number(upperTick)) : rangeTickPrice;
    if (!currentTick) return
    const increment = tickSpacing
    const adjustment = direction == 'plus' || direction == 'minus' ?
                        (direction == 'plus' ? -increment : increment) : 0;
    const newTick = roundTick(currentTick - adjustment, increment)
    const newPriceString = TickMath.getPriceStringAtTick(newTick);
    (document.getElementById(inputId) as HTMLInputElement).value = Number(newPriceString).toFixed(6)
    if (inputId === 'maxInput') {
      setUpperTick(BigNumber.from(newTick))
      setUpperPrice(newPriceString)
    }
    if (inputId === 'minInput') {
      setLowerTick(BigNumber.from(newTick))
      setLowerPrice(newPriceString)
    }
  }

  function changeDefaultIn(token: token) {
    if (token.symbol === tokenOut.symbol) {
      return
    }
    setTokenIn(token)
    if (token.address.localeCompare(tokenOut.address) < 0) {
      setTokenIn(token)
      if (hasSelected === true) {
        setTokenOut(tokenOut)
      }
      return
    }
    if (token.address.localeCompare(tokenOut.address) >= 0) {
      if (hasSelected === true) {
        setTokenIn(tokenOut)
      }
      setTokenOut(token)
      return
    }
  }

  const [tokenOrder, setTokenOrder] = useState(tokenIn.address.localeCompare(tokenOut.address) < 0)

  const changeDefaultOut = (token: token) => {
    if (token.symbol === tokenIn.symbol) {
      return
    }
    setTokenOut(token)
    setHasSelected(true)
    if (token.address.localeCompare(tokenIn.address) < 0) {
      setTokenIn(token)
      setTokenOut(tokenIn)
      return
    }

    if (token.address.localeCompare(tokenIn.address) >= 0) {
      setTokenIn(tokenIn)
      setTokenOut(token)
      return
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
              {feeTiers.map((feeTier, feeTierIdx) => (
                <Listbox.Option
                  key={feeTierIdx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 px-4 cursor-pointer ${
                      active ? 'opacity-80 bg-dark' : 'opacity-100'
                    }`
                  }
                  value={feeTier}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate text-white ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {feeTier.tier}
                      </span>
                      <span
                        className={`block truncate text-grey text-xs mt-1 ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {feeTier.text}
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
              selected={hasSelected}
              tokenChosen={changeDefaultIn}
              displayToken={tokenIn}
              balance={setQueryTokenIn}
              key={queryTokenIn}
            />
            <ArrowLongRightIcon
              className="w-6 cursor-pointer"
              onClick={() => {
                if (hasSelected) {
                  switchDirection()
                }
              }}
            />
            {hasSelected ? (
              <SelectToken
                index="1"
                selected={hasSelected}
                tokenChosen={changeDefaultOut}
                displayToken={tokenOut}
                balance={setQueryTokenOut}
                key={queryTokenOut + 'selected'}
              />
            ) : (
              //@dev add skeletons on load when switching sides/ initial selection
              <SelectToken
                index="1"
                selected={hasSelected}
                tokenChosen={changeDefaultOut}
                displayToken={tokenOut}
                balance={setQueryTokenOut}
                key={queryTokenOut + 'notselected'}
              />
            )}
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
                {mktRate[tokenIn.symbol] != '~$NaN' ? (
                  <div className="flex">
                    <div className="flex text-xs text-[#4C4C4C]">
                      ${mktRate[tokenIn.symbol] * Number(ethers.utils.formatUnits(bnInput, 18))}
                    </div>
                  </div>
                ) : (
                  <></>
                )}
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
                {Number(tokenOrder ? ethers.utils.formatUnits(amount1, 18)
                            : ethers.utils.formatUnits(amount0, 18))}
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
            <h1>Set price range</h1>
            <button
              className="text-grey text-xs bg-dark border border-grey1 px-4 py-1 rounded-md"
              onClick={() => {
                setLowerTick(BigNumber.from(-887272))
                setUpperTick(BigNumber.from(887272))
              }}
            >
              Full Range
            </button>
          </div>
          <div className="flex flex-col mt-6 gap-y-5 w-full">
            <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
              <span className="text-xs text-grey">Min Price</span>
              <div className="flex justify-center items-center">
                <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
                  <button onClick={() => changePrice('minus', 'minInput')}>
                    <MinusIcon className="w-5 h-5 ml-[2.5px]" />
                  </button>
                </div>
                <input
                  className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
                  placeholder="0"
                  id="minInput"
                  type="text"
                  value={lowerPrice}
                  onChange={() =>
                    setLowerPrice(
                      (document.getElementById('minInput') as HTMLInputElement)
                        ?.value
                          .replace(/^0+(?=[^.0-9]|$)/, match => match.length > 1 ? '0' : match)
                          .replace(/^(\.)+/, '0.')
                          .replace(/(?<=\..*)\./g, '')
                          .replace(/^0+(?=\d)/, '')
                          .replace(/[^\d.]/g, '')
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
                  className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
                  placeholder="0"
                  id="maxInput"
                  type="text"
                  value={upperPrice}
                  onChange={() =>
                    setUpperPrice(
                      (document.getElementById('maxInput') as HTMLInputElement)
                        ?.value
                          .replace(/^0+(?=[^.0-9]|$)/, match => match.length > 1 ? '0' : match)
                          .replace(/^(\.)+/, '0.')
                          .replace(/(?<=\..*)\./g, '')
                          .replace(/^0+(?=\d)/, '')
                          .replace(/[^\d.]/g, '')
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
          lowerPrice={lowerPrice}
          upperPrice={upperPrice}
          lowerTick={lowerTick}
          upperTick={upperTick}
          fee={selected.tier}
          allowance0={allowance0}
          setAllowance0={setAllowance0}
          allowance1={allowance1}
          setAllowance1={setAllowance1}
          disabled={isDisabled}
        />
      </div>
    </div>
  )
}
