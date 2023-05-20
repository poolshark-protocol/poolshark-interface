import {
  ChevronDownIcon,
  ArrowLongRightIcon,
  ArrowLongLeftIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/react/20/solid'
import { erc20ABI, useAccount, useContractRead } from 'wagmi'
import CoverMintButton from '../Buttons/CoverMintButton'
import { ConnectWalletButton } from '../Buttons/ConnectWalletButton'
import { useEffect, useState } from 'react'
import { BigNumber, ethers } from 'ethers'
import JSBI from 'jsbi'
import {
  getCoverPoolFromFactory,
} from '../../utils/queries'
import { TickMath, roundTick } from '../../utils/math/tickMath'
import SwapCoverApproveButton from '../Buttons/SwapCoverApproveButton'
import useInputBox from '../../hooks/useInputBox'
import { coverPoolABI } from '../../abis/evm/coverPool'
import { BN_ZERO, ZERO, ZERO_ADDRESS } from '../../utils/math/constants'
import { DyDxMath } from '../../utils/math/dydxMath'

export default function CoverExistingPool({
  account,
  poolId,
  tokenOneName,
  tokenOneSymbol,
  tokenOneLogoURI,
  tokenOneAddress,
  tokenOneValue,
  tokenZeroName,
  tokenZeroSymbol,
  tokenZeroLogoURI,
  tokenZeroAddress,
  tokenZeroValue,
  minLimit,
  maxLimit,
  zeroForOne,
  liquidity,
  feeTier,
  goBack,
}) {
  type token = {
    name: string
    symbol: string
    logoURI: string
    address: string
    value: string
  }
  const { bnInput, inputBox } = useInputBox()

  const { address, isConnected, isDisconnected } = useAccount()
  const initialBig = BigNumber.from(0)
  /* const [pool, updatePool] = useCoverStore((state: any) => [
    state.pool,
    state.updatePool,
  ]) */
  const [expanded, setExpanded] = useState(false)
  const [min, setMin] = useState(initialBig)
  const [max, setMax] = useState(initialBig)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [tokenOrder, setTokenOrder] = useState(zeroForOne)
  const [hasSelected, setHasSelected] = useState(true)
  const [queryTokenIn, setQueryTokenIn] = useState(tokenOneAddress)
  const [queryTokenOut, setQueryTokenOut] = useState(tokenOneAddress)
  const [isDisabled, setDisabled] = useState(true)
  const [amountToPay, setAmountToPay] = useState(0)
  const [tokenIn, setTokenIn] = useState({
    name: zeroForOne ? tokenZeroName : tokenOneName,
    symbol: zeroForOne ? tokenZeroSymbol : tokenOneSymbol,
    logoURI: zeroForOne ? tokenZeroLogoURI : tokenOneLogoURI,
    address: zeroForOne ? tokenZeroAddress : tokenOneAddress,
    value: zeroForOne ? tokenZeroValue : tokenOneValue,
  } as token)
  const [tokenOut, setTokenOut] = useState({
    name: zeroForOne ? tokenOneName : tokenZeroName,
    symbol: zeroForOne ? tokenOneSymbol : tokenZeroSymbol,
    logoURI: zeroForOne ? tokenOneLogoURI : tokenZeroLogoURI,
    address: zeroForOne ? tokenOneAddress : tokenZeroAddress,
    value: zeroForOne ? tokenOneValue : tokenZeroValue,
  } as token)

  const [sliderValue, setSliderValue] = useState(50)
  const [coverValue, setCoverValue] = useState(
    Number(Number(Number(tokenOut.value) / 2).toFixed(5)),
  )
  const [coverQuote, setCoverQuote] = useState(undefined)
  const [coverTickPrice, setCoverTickPrice] = useState(undefined)
  const [coverPoolRoute, setCoverPoolRoute] = useState(undefined)
  const [coverAmountIn, setCoverAmountIn] = useState(ZERO)
  const [allowance, setAllowance] = useState('0')
  const [mktRate, setMktRate] = useState({})
  const { data } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, coverPoolRoute],
    chainId: 421613,
    watch: true,
    enabled: coverPoolRoute != undefined && tokenIn.address != '',
    onSuccess(data) {
      console.log('allowance set:', allowance)
      console.log('slider value:', (sliderValue * Number(tokenIn.value)))
      console.log('Success')
      setAllowance(ethers.utils.formatUnits(data, 18))
    },
    onError(error) {
      console.log('Error', error)
    },
    onSettled(data, error) {
      console.log('Settled', { data, error })
    },
  })

  const { refetch: refetchCoverQuote, data: priceCover } = useContractRead({
    address: coverPoolRoute,
    abi: coverPoolABI,
    functionName:
      tokenOut.address != '' && tokenIn.address.localeCompare(tokenOut.address) < 0
        ? 'pool1'
        : 'pool0',
    args: [],
    chainId: 421613,
    watch: true,
    onSuccess(data) {
      console.log('Success price Cover', data)
      setCoverQuote(data[0])
      const price = TickMath.getPriceStringAtSqrtPrice(data[0])
      setCoverTickPrice(price)
      console.log('price set:', coverTickPrice)
    },
    onError(error) {
      setCoverTickPrice(ethers.utils.parseUnits(String(coverQuote), 0))
      console.log('Error price Cover', error)
    },
    onSettled(data, error) {
      //console.log('Settled price Cover', { data, error })
    },
  })

  useEffect(() => {
    setCoverValue(
      Number(Number(Number(tokenOut.value)).toFixed(5)) * sliderValue,
    )
  }, [minPrice, maxPrice, sliderValue, tokenIn.value, tokenOut.value])

  // TODO: update cover amount using changeAmountIn()
  // useEffect(() => {
  //   if (minPrice == '' || maxPrice == '') return
  //   changeAmountIn()
  // }), [coverValue]

  useEffect(() => {
    getCoverPool()
  }, [hasSelected, tokenIn.address, tokenOut.address])

  useEffect(() => {
    fetchTokenPrice()
  }, [coverQuote])

  useEffect(() => {
    setCoverParams()
  }, [minPrice, maxPrice])

  useEffect(() => {
    changeAmountIn()
  }, [coverValue, minPrice, maxPrice])

  /* console.log('tokenIn',tokenIn)
  console.log('coverTickPrice', Number(coverTickPrice))
  console.log('mktRatePrice', mktRate[tokenIn.symbol]) */

  const getCoverPool = async () => {
    console.log('liquidity', liquidity)
    try {
      let pool
      if (tokenIn.address.localeCompare(tokenOut.address) < 0) {
        pool = await getCoverPoolFromFactory(tokenIn.address, tokenOut.address)
      } else {
        pool = await getCoverPoolFromFactory(tokenOut.address, tokenIn.address)
      }
      let id = ZERO_ADDRESS
      let dataLength = pool['data']['coverPools'].length
      if(dataLength != 0) id = pool['data']['coverPools']['0']['id']
      setCoverPoolRoute(id)
    } catch (error) {
      console.log(error)
    }
  }

  function changeAmountIn() {
    console.log('prices set:', minPrice, maxPrice)
    if (minPrice == maxPrice || minPrice !== '' || maxPrice !== '') return
    const minSqrtPrice = TickMath.getSqrtPriceAtPriceString(minPrice, 20)
    const maxSqrtPrice = TickMath.getSqrtPriceAtPriceString(maxPrice, 20)
    const liquidityAmount = DyDxMath.getLiquidityForAmounts(
      minSqrtPrice,
      maxSqrtPrice,
      tokenOrder ? minSqrtPrice
                 : maxSqrtPrice,
      tokenOrder ? ethers.utils.parseUnits(coverValue.toString(), 18) : BN_ZERO,
      tokenOrder ? BN_ZERO : ethers.utils.parseUnits(coverValue.toString(), 18)
    )
    setCoverAmountIn(tokenOrder ? DyDxMath.getDx(liquidityAmount, minSqrtPrice, maxSqrtPrice, true)
                                : DyDxMath.getDy(liquidityAmount, minSqrtPrice, maxSqrtPrice, true))
  console.log('amount in set:', coverAmountIn.toString())
  }

  const handleChange = (event: any) => {
    setSliderValue(event.target.value)
  }

  function switchDirection() {
    setTokenOrder(!tokenOrder)
    const temp = tokenIn
    setTokenIn(tokenOut)
    setTokenOut(temp)
    const tempBal = queryTokenIn
    setQueryTokenIn(queryTokenOut)
    setQueryTokenOut(tempBal)
    setSliderValue(50)
  }

  async function setCoverParams() {
    try {
      if (
        minPrice !== undefined &&
        minPrice !== '' &&
        maxPrice !== undefined &&
        maxPrice !== '' &&
        Number(ethers.utils.formatUnits(sliderValue)) !== 0
      ) {
        const min = TickMath.getTickAtPriceString(minPrice)
        const max = TickMath.getTickAtPriceString(maxPrice)
      } else {
        return
      }
      const min = TickMath.getTickAtPriceString(minPrice)
      const max = TickMath.getTickAtPriceString(maxPrice)
      setMin(BigNumber.from(String(min)))
      setMax(BigNumber.from(String(max)))
      setDisabled(false)
    } catch (error) {
      console.log(error)
    }
  }

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

  const fetchTokenPrice = async () => {
    try {
      setMktRate({
        TOKEN20A:
          Number(coverTickPrice).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          }),
        TOKEN20B: '1.00',
      })
      console.log('market rate set', mktRate)
    } catch (error) {
      console.log(error)
    }
  }

  const Option = () => {
    if (expanded) {
      return (
        <div className="flex flex-col justify-between w-full my-1 px-1 break-normal transition duration-500 h-fit">
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Expected Output</div>
            <div className="ml-auto text-xs">300 DAI</div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Price Impact</div>
            <div className="ml-auto text-xs">-0.12%</div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">
              Mininum recieved after slippage (0.50%)
            </div>
            <div className="ml-auto text-xs">299.92 DAI</div>
          </div>
          <div className="flex p-1">
            <div className="text-xs text-[#4C4C4C]">Network Fee</div>
            <div className="ml-auto text-xs">-0.09$</div>
          </div>
        </div>
      )
    }
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-row justify-between">
          <h1 className="mb-3">Selected Pool</h1>
          <span
            className="flex gap-x-1 cursor-pointer"
            onClick={() => goBack('initial')}
          >
            <ArrowLongLeftIcon className="w-4 opacity-50 mb-3 " />
            <h1 className="mb-3 opacity-50">Back</h1>
          </span>
        </div>
        <div className="flex gap-x-4 items-center">
          <button className="flex items-center gap-x-3 bg-black border border-grey1 px-4 py-1.5 rounded-xl">
            <div className="flex items-center gap-x-2 w-full">
              <img className="w-7" src={tokenIn.logoURI} />
              {tokenIn.name}
            </div>
          </button>
          <ArrowLongRightIcon
            className="w-6 cursor-pointer"
            onClick={() => {
              if (hasSelected) {
                switchDirection()
              }
            }}
          />
          <button className="flex items-center gap-x-3 bg-black border border-grey1 px-4 py-1.5 rounded-xl">
            <div className="flex items-center gap-x-2 w-full">
              <img className="w-7" src={tokenOut.logoURI} />
              {tokenOut.name}
            </div>
          </button>
        </div>
      </div>
      <h1 className="mb-3">How much do you want to Cover?</h1>
      <div className="w-full flex items-center justify-between text-xs text-[#646464]">
        <div>0</div>
        <div>Full</div>
      </div>
      <div className="w-full flex items-center mt-2">
        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={handleChange}
          className="w-full styled-slider slider-progress bg-transparent"
        />
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <div className="text-[#646464]">Percentage Covered</div>
          <div className="flex gap-x-2 items-center">
            <input
              type="string"
              id="input"
              onChange={(e) => {
                setSliderValue(Number(e.target.value.replace(/[^\d.]/g, '')))
                console.log('slider value', sliderValue)
              }}
              onKeyDown={ (evt) => (evt.key === 'e' || evt.key === 'E')  && evt.preventDefault() } 
              value={sliderValue}
              className="text-right placeholder:text-grey1 text-white text-2xl w-20 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none bg-black"
            />
            %
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <div className="text-[#646464]">Amount Covered</div>
          <div>
            <input
              type="string"
              id="input"
              onChange={(e) => {
                console.log('cover amount changed', sliderValue)
                if (Number(e.target.value.replace(/[^\d.]/g, '')) / Number(tokenOut.value) < 100) {
                  setSliderValue(
                    Number(e.target.value.replace(/[^\d.]/g, '')) / Number(tokenOut.value),
                  )
                } else {
                  setSliderValue(100)
                }
                setCoverValue(Number(e.target.value.replace(/[^\d.]/g, '')))
              }}
              onKeyDown={ (evt) => (evt.key === 'e' || evt.key === 'E')  && evt.preventDefault() } 
              value={coverValue}
              className="bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
            />
          </div>
          <div>{tokenOut.name}</div>
        </div>
        {mktRate[tokenIn.symbol] ? (
          <div className="flex justify-between text-sm">
            <div className="text-[#646464]">Amount to pay</div>
            <div>
              {Number(ethers.utils.formatUnits(coverAmountIn.toString(), 18)).toFixed(2)}
              $
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
      <h1 className="mb-3 mt-4">Set Price Range</h1>
      <div className="flex justify-between w-full gap-x-6">
        <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
          <span className="text-xs text-grey">Min Price</span>
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
              onKeyDown={ (evt) => (evt.key === 'e' || evt.key === 'E')  && evt.preventDefault() } 
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
              onKeyDown={ (evt) => (evt.key === 'e' || evt.key === 'E')  && evt.preventDefault() } 
            />
            <div className="border border-grey1 text-grey flex items-center h-7 w-7 justify-center rounded-lg text-white cursor-pointer hover:border-gray-600">
              <button onClick={() => changePrice('plus', 'max')}>
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="py-4">
        <div
          className="flex px-2 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex-none text-xs uppercase text-[#C9C9C9]">
            1 {tokenIn.name} = 1 {tokenOut.name}
          </div>
          <div className="ml-auto text-xs uppercase text-[#C9C9C9]">
            <button>
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-wrap w-full break-normal transition ">
          <Option />
        </div>
      </div>
      <div className="space-y-3">
        {isDisconnected ? <ConnectWalletButton /> : null}
        {isDisconnected ||
        Number(allowance) < Number(sliderValue) * JSBI.toNumber(coverAmountIn) ? (
          <SwapCoverApproveButton
          disabled={isDisabled}
          poolAddress={poolId} 
          approveToken={tokenIn.address} />
        ) : (
          <CoverMintButton
            poolAddress={coverPoolRoute}
            disabled={isDisabled}
            to={address}
            lower={min}
            claim={(tokenOut.address != '' && tokenIn.address.localeCompare(tokenOut.address) < 0) ?
                max : min}
            upper={max}
            amount={coverAmountIn}
            zeroForOne={tokenOut.address != '' && tokenIn.address.localeCompare(tokenOut.address) < 0}
            tickSpacing={20}
          />
        )}
      </div>
    </>
  )
}
