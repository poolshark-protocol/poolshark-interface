import { Fragment, useEffect, useState } from 'react'
import { ChevronDownIcon, PlusIcon, MinusIcon } from '@heroicons/react/20/solid'
import { Listbox, Transition } from '@headlessui/react'
import SelectToken from '../SelectToken'
import ConcentratedPoolPreview from './ConcentratedPoolPreview'
import { ethers } from 'ethers'
import { useRangeStore } from '../../hooks/useStore'
import { TickMath } from '../../utils/tickMath'
import JSBI from 'jsbi'
import { getPreviousTicksLower } from '../../utils/queries'
import useInputBox from '../../hooks/useInputBox'
import useCoverAllowance from '../../hooks/useCoverAllowance'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/router'
import {
  rangeTokenOne,
  rangeTokenZero,
} from '../../constants/contractAddresses'

export default function ConcentratedPool({
  account,
  key,
  poolId,
  tokenOneName,
  tokenOneSymbol,
  tokenOneLogoURI,
  tokenOneAddress,
  tokenZeroName,
  tokenZeroSymbol,
  tokenZeroLogoURI,
  tokenZeroAddress,
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
      text: 'Best for very stable pairs',
      unavailable: false,
    },
    {
      id: 2,
      tier: '0.05%',
      text: 'Best for stable pairs',
      unavailable: false,
    },
    { id: 3, tier: '0.3%', text: 'Best for most pairs', unavailable: false },
    { id: 4, tier: '1%', text: 'Best for exotic pairs', unavailable: false },
  ]
  const { address, isConnected, isDisconnected } = useAccount()

  const [minPrice, setMinPrice] = useState('0')
  const [maxPrice, setMaxPrice] = useState('0')
  const [selected, setSelected] = useState(feeTiers[0])
  const [queryToken0, setQueryToken0] = useState(tokenOneAddress)
  const [queryToken1, setQueryToken1] = useState(tokenOneAddress)

  const [token0, setToken0] = useState({
    symbol: tokenZeroSymbol,
    logoURI: tokenZeroLogoURI,
    address: rangeTokenZero,
  } as token)
  const [token1, setToken1] = useState({
    symbol: tokenOneSymbol,
    logoURI: tokenOneLogoURI,
    address: rangeTokenOne,
  } as token)
  const [tokenIn, setTokenIn] = useState({
    symbol: tokenZeroSymbol,
    logoURI: tokenZeroLogoURI,
    address: rangeTokenZero,
  })
  const [tokenOut, setTokenOut] = useState({
    symbol: tokenOneSymbol,
    logoURI: tokenOneLogoURI,
    address: rangeTokenOne,
  })

  const [hasSelected, setHasSelected] = useState(false)
  const [isDisabled, setDisabled] = useState(false)

  const { bnInput, bnInputLimit, LimitInputBox, inputBox } = useInputBox()

  const newAllowance = useCoverAllowance(address)

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

  async function setRangeParams() {
    try {
      if (
        minPrice !== undefined &&
        minPrice !== '' &&
        maxPrice !== undefined &&
        maxPrice !== '' &&
        Number(ethers.utils.formatUnits(bnInput)) !== 0 &&
        hasSelected == true
      ) {
        const min = TickMath.getTickAtSqrtRatio(
          JSBI.divide(
            JSBI.multiply(
              JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96)),
              JSBI.BigInt(
                String(
                  Math.sqrt(Number(parseFloat(minPrice).toFixed(30))).toFixed(
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
        const max = TickMath.getTickAtSqrtRatio(
          JSBI.divide(
            JSBI.multiply(
              JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96)),
              JSBI.BigInt(
                String(
                  Math.sqrt(Number(parseFloat(maxPrice).toFixed(30))).toFixed(
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
        updateRangeContractParams({
          to: address,
          min: ethers.utils.parseUnits(String(min), 0),
          max: ethers.utils.parseUnits(String(max), 0),
          amount0: bnInput,
          amount1: bnInputLimit,
          fungible: true,
        })
        setDisabled(false)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    setRangeParams()
  }, [address, minPrice, maxPrice, bnInput, bnInputLimit])

  const changePrice = (direction: string, minMax: string) => {
    if (direction === 'plus' && minMax === 'min') {
      if (
        (document.getElementById('minInput') as HTMLInputElement).value ===
        undefined
      ) {
        const current = document.getElementById('minInput') as HTMLInputElement
        current.value = '1'
      }
      const current = Number(
        (document.getElementById('minInput') as HTMLInputElement).value,
      )
      ;(document.getElementById('minInput') as HTMLInputElement).value = String(
        (current + 0.01).toFixed(3),
      )
    }
    if (direction === 'minus' && minMax === 'min') {
      const current = Number(
        (document.getElementById('minInput') as HTMLInputElement).value,
      )
      if (current === 0 || current - 1 < 0) {
        ;(document.getElementById('minInput') as HTMLInputElement).value = '0'
        return
      }
      ;(document.getElementById('minInput') as HTMLInputElement).value = (
        current - 0.01
      ).toFixed(3)
    }

    if (direction === 'plus' && minMax === 'max') {
      if (
        (document.getElementById('maxInput') as HTMLInputElement).value ===
        undefined
      ) {
        const current = document.getElementById('maxInput') as HTMLInputElement
        current.value = '1'
      }
      const current = Number(
        (document.getElementById('maxInput') as HTMLInputElement).value,
      )
      ;(document.getElementById('maxInput') as HTMLInputElement).value = (
        current + 0.01
      ).toFixed(3)
    }
    if (direction === 'minus' && minMax === 'max') {
      const current = Number(
        (document.getElementById('maxInput') as HTMLInputElement).value,
      )
      if (current === 0 || current - 1 < 0) {
        ;(document.getElementById('maxInput') as HTMLInputElement).value = '0'
        return
      }
      ;(document.getElementById('maxInput') as HTMLInputElement).value = (
        current - 0.01
      ).toFixed(3)
    }
  }

  function changeDefaultIn(token: token) {
    if (token.symbol === tokenOut.symbol) {
      return
    }
    setTokenIn(token)
    if (token.address.localeCompare(tokenOut.address) < 0) {
      setToken0(token)
      if (hasSelected === true) {
        setToken1(tokenOut)
      }
      return
    }
    if (token.address.localeCompare(tokenOut.address) >= 0) {
      if (hasSelected === true) {
        setToken0(tokenOut)
      }
      setToken1(token)
      return
    }
  }

  const [tokenOrder, setTokenOrder] = useState(true)

  const changeDefaultOut = (token: token) => {
    if (token.symbol === tokenIn.symbol) {
      return
    }
    setTokenOut(token)
    setHasSelected(true)
    if (token.address.localeCompare(tokenIn.address) < 0) {
      setToken0(token)
      setToken1(tokenIn)
      return
    }

    if (token.address.localeCompare(tokenIn.address) >= 0) {
      setToken0(tokenIn)
      setToken1(token)
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
              balance={setQueryToken0}
              key={queryToken0}
            />
            {hasSelected ? (
              <SelectToken
                index="1"
                selected={hasSelected}
                tokenChosen={changeDefaultOut}
                displayToken={tokenOut}
                balance={setQueryToken1}
                key={queryToken1}
              />
            ) : (
              //@dev add skeletons on load when switching sides/ initial selection
              <SelectToken
                index="1"
                selected={hasSelected}
                tokenChosen={changeDefaultOut}
                displayToken={tokenOut}
                balance={setQueryToken1}
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
              <div className=" p-2 ">
                {inputBox('0')}
                <div className="flex">
                  <div className="flex text-xs text-[#4C4C4C]">~300.50</div>
                </div>
              </div>
              <div className="">
                <div className=" ml-auto">
                  <div>
                    <div className="flex justify-end">
                      <button className="flex items-center gap-x-3 bg-black border border-grey1 px-3 py-1.5 rounded-xl ">
                        <div className="flex items-center gap-x-2 w-full">
                          <img className="w-7" src={tokenIn.logoURI} />
                          {tokenIn.symbol}
                        </div>
                      </button>
                    </div>
                    <div className="flex items-center justify-end gap-x-2 px-1 mt-2">
                      <div className="text-xs text-[#4C4C4C]">
                        Balance: 420.69
                      </div>
                      <div className="text-xs uppercase text-[#C9C9C9]">
                        Max
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full items-center justify-between flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
              <div className=" p-2 ">
                {LimitInputBox('0')}
                <div className="flex">
                  <div className="flex text-xs text-[#4C4C4C]">~300.50</div>
                </div>
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
                      <div className="text-xs text-[#4C4C4C]">
                        Balance: 420.69
                      </div>
                      <div className="text-xs uppercase text-[#C9C9C9]">
                        Max
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
            <button className="text-grey text-xs bg-dark border border-grey1 px-4 py-1 rounded-md">
              Full Range
            </button>
          </div>
          <div className="flex flex-col mt-6 gap-y-5 w-full">
            <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
              <span className="text-xs text-grey">Min. Price</span>
              <div className="flex justify-center items-center">
                <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
                  <button onClick={() => changePrice('minus', 'min')}>
                    <MinusIcon className="w-5 h-5 ml-[2.5px]" />
                  </button>
                </div>
                <input
                  className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
                  placeholder="0"
                  id="minInput"
                  type="number"
                  onChange={() =>
                    setMinPrice(
                      (document.getElementById('minInput') as HTMLInputElement)
                        ?.value,
                    )
                  }
                />
                <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
                  <button onClick={() => changePrice('plus', 'min')}>
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
              <span className="text-xs text-grey">Max. Price</span>
              <div className="flex justify-center items-center">
                <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
                  <button onClick={() => changePrice('minus', 'max')}>
                    <MinusIcon className="w-5 h-5 ml-[2.5px]" />
                  </button>
                </div>
                <input
                  className="bg-[#0C0C0C] py-2 outline-none text-center w-full"
                  placeholder="0"
                  id="maxInput"
                  type="number"
                  onChange={() =>
                    setMaxPrice(
                      (document.getElementById('maxInput') as HTMLInputElement)
                        ?.value,
                    )
                  }
                />
                <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
                  <button onClick={() => changePrice('plus', 'max')}>
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ConcentratedPoolPreview
          account={account}
          poolId={poolId}
          tokenIn={tokenIn}
          tokenOut={tokenOut}
          amount0={bnInput}
          amount1={bnInputLimit}
          minPrice={minPrice}
          maxPrice={maxPrice}
          fee={selected.tier}
        />
      </div>
    </div>
  )
}
