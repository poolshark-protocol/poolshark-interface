import { Fragment, useEffect, useState } from 'react'
import {
  ChevronDownIcon,
  PlusIcon,
  MinusIcon,
  ArrowLongRightIcon,
} from '@heroicons/react/20/solid'
import { Listbox, Transition } from '@headlessui/react'
import SelectToken from '../SelectToken'
import DirectionalPoolPreview from './DirectionalPoolPreview'
import { useCoverStore } from '../../hooks/useStore'
import { TickMath } from '../../utils/math/tickMath'
import JSBI from 'jsbi'
import { fetchPrice } from '../../utils/queries'
import useInputBox from '../../hooks/useInputBox'
import { erc20ABI, useAccount } from 'wagmi'
import { BigNumber, Contract, ethers } from 'ethers'

export default function DirectionalPool({
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
  minLimit,
  maxLimit,
  liquidity,
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
  const {
    bnInput,
    inputBox,
    maxBalance,
    bnInputLimit,
    LimitInputBox,
  } = useInputBox()
  const [
    updatecoverContractParams,
    updatecoverAllowance,
    coverAllowance,
    coverContractParams,
  ] = useCoverStore((state: any) => [
    state.updatecoverContractParams,
    state.updatecoverAllowance,
    state.coverAllowance,
    state.coverContractParams,
  ])

  const initialBig = BigNumber.from(0)
  const [to, setTo] = useState('')
  const [min, setMin] = useState(initialBig)
  const [max, setMax] = useState(initialBig)
  const [amount0, setAmount0] = useState(initialBig)
  const [amount1, setAmount1] = useState(initialBig)
  const [minPrice, setMinPrice] = useState('0')
  const [maxPrice, setMaxPrice] = useState('0')
  const [feeControler, setFeeControler] = useState(false)
  const [selected, setSelected] = useState(feeTiers[0])
  const [queryTokenIn, setQueryTokenIn] = useState(tokenOneAddress)
  const [queryTokenOut, setQueryTokenOut] = useState(tokenOneAddress)
  const [balance0, setBalance0] = useState('')
  const [balance1, setBalance1] = useState('0.00')
  const [tokenIn, setTokenIn] = useState({
    symbol: tokenZeroSymbol,
    logoURI: tokenZeroLogoURI,
    address: tokenZeroAddress,
  } as token)
  const [tokenOut, setTokenOut] = useState({
    symbol: tokenOneSymbol,
    logoURI: tokenOneLogoURI,
    address: tokenOneAddress,
  } as token)
  const [allowance, setAllowance] = useState('0.00')
  console.log('allowance', allowance)

  const [mktRate, setMktRate] = useState({})

  const [hasSelected, setHasSelected] = useState(true)
  const [isDisabled, setDisabled] = useState(false)

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

  useEffect(() => {
    getBalances()
  }, [bnInput, bnInputLimit])

  useEffect(() => {
    fetchTokenPrice()
  }, [])

  const fetchTokenPrice = async () => {
    try {
      const price = await fetchPrice('0x000')
      setMktRate({
        WETH:
          '~' +
          Number(price['data']['bundles']['0']['ethPriceUSD']).toLocaleString(
            'en-US',
            {
              style: 'currency',
              currency: 'USD',
            },
          ),
        USDC: '~1.00',
        TOKEN20A: '~1.00',
        TOKEN20B: '~1.00',
      })
    } catch (error) {
      console.log(error)
    }
  }

  async function setCoverParams() {
    try {
      if (
        minPrice !== undefined &&
        minPrice !== '' &&
        maxPrice !== undefined &&
        maxPrice !== '' &&
        Number(ethers.utils.formatUnits(bnInput)) !== 0 &&
        hasSelected == true
      ) {
        const min = TickMath.getTickAtPriceString(minPrice)
        const max = TickMath.getTickAtPriceString(maxPrice)
        setTo(address)
        setMin(ethers.utils.parseUnits(String(min), 0))
        setMax(ethers.utils.parseUnits(String(max), 0))
        setAmount0(bnInput)
        setAmount1(bnInputLimit)

        updatecoverContractParams({
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
    setCoverParams()
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

  const [tokenOrder, setTokenOrder] = useState(true)

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

  const getBalances = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        'https://arb-goerli.g.alchemy.com/v2/M8Dr_KQx46ghJ93XDQe7j778Qa92HRn2',
        421613,
      )
      const signer = new ethers.VoidSigner(address, provider)
      const token1Bal = new ethers.Contract(tokenIn.address, erc20ABI, signer)
      const balance1 = await token1Bal.balanceOf(address)
      let token2Bal: Contract
      let bal1: string
      bal1 = Number(ethers.utils.formatEther(balance1)).toFixed(2)
      if (hasSelected === true) {
        token2Bal = new ethers.Contract(tokenOut.address, erc20ABI, signer)
        const balance2 = await token2Bal.balanceOf(address)
        let bal2: string
        bal2 = Number(ethers.utils.formatEther(balance2)).toFixed(2)

        setBalance1(bal2)
      }

      setBalance0(bal1)
    } catch (error) {
      console.log(error)
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
                key={queryTokenOut}
              />
            ) : (
              //@dev add skeletons on load when switching sides/ initial selection
              <SelectToken
                index="1"
                selected={hasSelected}
                tokenChosen={changeDefaultOut}
                displayToken={tokenOut}
                balance={setQueryTokenOut}
              />
            )}
          </div>
        </div>
        <div>
          <div className="gap-x-4 mt-8">
            <h1>Volatility tier</h1>
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
              <div className=" p-2 ">{inputBox('0')}</div>
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
                      <div className="flex text-xs text-[#4C4C4C]">
                        Balance: {balance0 === 'NaN' ? 0 : balance0}
                      </div>
                      {isConnected ? (
                        <button
                          className="flex text-xs uppercase text-[#C9C9C9]"
                          onClick={() => maxBalance(balance0, '0')}
                        >
                          Max
                        </button>
                      ) : null}
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
            <h1>Set price cover</h1>
            <button
              className="text-grey text-xs bg-dark border border-grey1 px-4 py-1 rounded-md"
              onClick={() => {
                setMin(BigNumber.from(-887272))
                setMax(BigNumber.from(887272))
              }}
            >
              Full cover
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
        <DirectionalPoolPreview
          account={to}
          poolId={poolId}
          tokenIn={tokenIn}
          tokenOut={tokenOut}
          amount0={amount0}
          amount1={amount1}
          minPrice={minPrice}
          maxPrice={maxPrice}
          minTick={min}
          maxTick={max}
          fee={selected.tier}
          allowance={allowance}
          tickSpacing={20}
          setAllowance={setAllowance}
        />
      </div>
    </div>
  )
}
