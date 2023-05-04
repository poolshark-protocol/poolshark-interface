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
import CoverApproveButton from '../Buttons/CoverApproveButton'
import { useEffect, useState } from 'react'
import { useCoverStore } from '../../hooks/useStore'
import useCoverAllowance from '../../hooks/useCoverAllowance'
import { BigNumber, ethers } from 'ethers'
import JSBI from 'jsbi'
import {
  getPreviousTicksLower,
  getPreviousTicksUpper,
} from '../../utils/queries'
import { TickMath } from '../../utils/tickMath'
import {
  coverPoolAddress,
  rangePoolAddress,
  tokenOneAddress,
} from '../../constants/contractAddresses'
import SwapCoverApproveButton from '../Buttons/SwapCoverApproveButton'
import useInputBox from '../../hooks/useInputBox'

export default function CoverExistingPool({
  account,
  key,
  poolId,
  liquidity,
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
  const [tokenOrder, setTokenOrder] = useState(true)
  const [hasSelected, setHasSelected] = useState(true)
  const [queryTokenIn, setQueryTokenIn] = useState(tokenOneAddress)
  const [queryTokenOut, setQueryTokenOut] = useState(tokenOneAddress)
  const [tokenIn, setTokenIn] = useState({
    name: tokenZeroName,
    symbol: tokenZeroSymbol,
    logoURI: tokenZeroLogoURI,
    address: tokenZeroAddress,
    value: tokenZeroValue,
  } as token)
  const [tokenOut, setTokenOut] = useState({
    name: tokenOneName,
    symbol: tokenOneSymbol,
    logoURI: tokenOneLogoURI,
    address: tokenOneAddress,
    value: tokenOneValue,
  } as token)
  const [sliderValue, setSliderValue] = useState(50)
  const [coverValue, setCoverValue] = useState(
    Number(Number(Number(tokenOut.value) / 2).toFixed(5)),
  )
  const [allowance, setAllowance] = useState('0')
  const { data } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, coverPoolAddress],
    chainId: 421613,
    watch: true,
    onSuccess(data) {
      console.log('Success')
    },
    onError(error) {
      console.log('Error', error)
    },
    onSettled(data, error) {
      console.log('Settled', { data, error })
    },
  })
  /* console.log('data ex', data)
  console.log('tokenIn ex', tokenIn)
  console.log('tokenOut ex', tokenOut) */

  useEffect(() => {
    if (data) {
      setAllowance(ethers.utils.formatUnits(data, 18))
    }
  }, [data, tokenIn.address, sliderValue])

  useEffect(() => {
    setCoverValue(
      Number(Number(Number(tokenOut.value)).toFixed(5)) * sliderValue,
    )
    //var value = Number((coverValue * 100) / Number(tokenIn.value))
    //if (value > 100) value = 100
    //setSliderValue(value)
  }, [sliderValue, tokenIn.value, tokenOut.value])

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
        /*updateCoverContractParams({
          prevLower: ethers.utils.parseUnits(
            data['data']['ticks'][0]['index'],
            0,
          ),
          min: ethers.utils.parseUnits(String(min), 0),
          prevUpper: ethers.utils.parseUnits(
            data1['data']['ticks'][0]['index'],
            0,
          ),
          max: ethers.utils.parseUnits(String(max), 0),
          claim: ethers.utils.parseUnits(String(min), 0),
          amount: bnInput,
          inverse: false,
        })*/
      }
      setMin(ethers.utils.parseUnits(String(min), 0))
      setMax(ethers.utils.parseUnits(String(max), 0))
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    setCoverParams()
  }, [minPrice, maxPrice, sliderValue])

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

  const getAllowance = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        'https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594',
      )
      const signer = new ethers.VoidSigner(address, provider)
      const contract = new ethers.Contract(tokenIn.address, erc20ABI, signer)
      const allowance = await contract.allowance(address, rangePoolAddress)

      //console.log('allowance', allowance)
      setAllowance(allowance)
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
            onChange={(e) => setSliderValue(Number(e.target.value))}
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
                if (Number(e.target.value) / Number(tokenOut.value) < 100) {
                  setSliderValue(
                    Number(e.target.value) / Number(tokenOut.value),
                  )
                } else {
                  setSliderValue(100)
                }
                setCoverValue(Number(e.target.value))
              }}
              value={coverValue}
              className="bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
            />
          </div>
          <div>{tokenOut.name}</div>
        </div>
        <div className="flex justify-between text-sm">
          <div className="text-[#646464]">Amount to pay</div>
          <div>
            {Number(sliderValue) * Number(tokenIn.value)} {tokenIn.name}
          </div>
        </div>
      </div>
      <h1 className="mb-3 mt-4">Set Price Range</h1>
      <div className="flex justify-between w-full gap-x-6">
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
        Number(allowance) < Number(sliderValue) * Number(tokenIn.value) ? (
          <SwapCoverApproveButton approveToken={tokenIn.address} />
        ) : (
          <CoverMintButton
            disabled={false}
            to={address}
            lower={min}
            claim={min}
            upper={max}
            amount={ethers.utils
              .parseUnits(String(sliderValue * 0.01), 18)
              .mul(1)}
            zeroForOne={true}
          />
        )}
      </div>
    </>
  )
}
