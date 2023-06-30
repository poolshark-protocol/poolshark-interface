import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useEffect, useState } from 'react'
import { XMarkIcon } from "@heroicons/react/20/solid";
import { useSigner, useSwitchNetwork } from "wagmi";
import useInputBox from '../../../hooks/useInputBox'
import RangeAddLiqButton from '../../Buttons/RangeAddLiqButton'
import RangeRemoveLiqButton from "../../Buttons/RangeRemoveLiqButton";
import { BigNumber, ethers } from "ethers";
import { BN_ZERO, ZERO } from "../../../utils/math/constants";
import JSBI from "jsbi";
import { DyDxMath } from "../../../utils/math/dydxMath";
import { TickMath } from "../../../utils/math/tickMath";
import { gasEstimateRangeBurn } from "../../../utils/gas";


export default function RangeRemoveLiquidity({ isOpen, setIsOpen, tokenIn, tokenOut, poolAdd, address, lowerTick, upperTick, userLiquidity, tokenAmount, rangePrice}) {

  const {
    bnInput,
    inputBox,
    maxBalance,
    bnInputLimit,
    LimitInputBox,
    setDisplay
  } = useInputBox()

  console.log('remove user liquidity', userLiquidity.toString(), tokenAmount.toString())

  const [balance0, setBalance0] = useState('')
  const [balance1, setBalance1] = useState('0.00')
  const [sliderValue, setSliderValue] = useState(0)
  const [burnPercent, setBurnPercent] = useState(BN_ZERO)
  const [disabled, setDisabled] = useState(true)
  const [amount0, setAmount0] = useState(BN_ZERO)
  const [amount1, setAmount1] = useState(BN_ZERO)
  const tokenOrder = tokenIn.address.localeCompare(tokenOut.address) < 0
  const [ rangeSqrtPrice, setRangeSqrtPrice ] = useState(JSBI.BigInt(rangePrice))
  const [ fetchDelay, setFetchDelay ] = useState(false)
  const [ gasLimit, setGasLimit ] = useState(BN_ZERO)
  const [ gasFee, setGasFee ] = useState('$0.00')
  const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(lowerTick)
  const upperSqrtPrice = TickMath.getSqrtRatioAtTick(upperTick)
  const {data: signer} = useSigner()

  useEffect(() => {
    const percentInput = sliderValue
    //console.log('percent input', percentInput, tokenAmount, BigNumber.from(percentInput).mul(BigNumber.from(tokenAmount)).div(BigNumber.from(100)).toString())
    if (percentInput <= 0 || percentInput > 100) {
      setDisabled(true)
      return
    } else {
      setDisabled(false)
    }
    const tokenAmountToBurn = BigNumber.from(percentInput).mul(BigNumber.from(tokenAmount)).div(BigNumber.from(100))
    setBurnPercent(ethers.utils.parseUnits(sliderValue.toString(), 36))
    console.log('new burn percent', ethers.utils.parseUnits(sliderValue.toString(), 36).toString())
    setAmounts(JSBI.BigInt(tokenAmountToBurn), true)
  }, [sliderValue])

  useEffect(() => {
    setLiquidity()
  }, [bnInput])

  useEffect(() => {
    updateGasFee()
  }, [burnPercent])

  const handleChange = (event: any) => {
    if (Number(event.target.value) != 0) {
      setSliderValue(event.target.value)
    } else {
      setSliderValue(0)
    }
  }
  
  const handleSliderButton = (percent: number) => {
    setSliderValue(percent)
  }

  async function updateGasFee() {
    //TODO: burnPercent value is correct here but still showing as '0' in gasEstimate function
    const newBurnGasFee = await gasEstimateRangeBurn(
      poolAdd,
      address,
      lowerTick,
      upperTick,
      burnPercent,
      signer
    )

    if (!fetchDelay && newBurnGasFee.gasUnits.gt(BN_ZERO)) setFetchDelay(true)
    setGasFee(newBurnGasFee.formattedPrice)
    setGasLimit(newBurnGasFee.gasUnits.mul(200).div(100))
  }

  function setLiquidity() {
    try {
      if (
        Number(ethers.utils.formatUnits(bnInput)) !== 0
      ) {
        const liquidityRemoved = JSBI.greaterThanOrEqual(rangeSqrtPrice, lowerSqrtPrice) &&
                          JSBI.lessThanOrEqual(rangeSqrtPrice, upperSqrtPrice) ?
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
          console.log('new burn percent', BigNumber.from(String(liquidityRemoved)).mul(ethers.utils.parseUnits('1', 38)).div(BigNumber.from(userLiquidity)).toString())
          setBurnPercent(BigNumber.from(String(liquidityRemoved)).mul(ethers.utils.parseUnits('1', 38)).div(BigNumber.from(userLiquidity)))
          setAmounts(liquidityRemoved)
        } else {
          setAmounts(ZERO)
          setDisabled(true)
        }
      } catch (error) {
        console.log(error)
      } 
  }

  function setAmounts(liquidity: JSBI, changeDisplay = false) {
    try {
      if (
        JSBI.greaterThan(liquidity, ZERO)
      ) {
        const amounts = DyDxMath.getAmountsForLiquidity(
          lowerSqrtPrice,
          upperSqrtPrice,
          rangeSqrtPrice,
          liquidity,
          true
        )
        // set amount based on liquidity math
        const amount0Bn = BigNumber.from(String(amounts.token0Amount))
        console.log('token1 amount', amounts.token1Amount)
        const amount1Bn = BigNumber.from(String(amounts.token1Amount))
        if (changeDisplay) setDisplay(Number(ethers.utils.formatUnits(tokenOrder ? amount0Bn : amount1Bn, 18)).toPrecision(6))
        setAmount0(amount0Bn) 
        setAmount1(amount1Bn)
        setDisabled(false)
      } else {
        setAmount1(BN_ZERO) 
        setAmount0(BN_ZERO)
        setDisabled(true)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => setIsOpen(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-black text-white border border-grey2 text-left align-middle shadow-xl px-5 py-5 transition-all">
                <div className="flex items-center justify-between px-2">
                  <h1 className="text-lg">Remove Liquidity</h1>
                  <XMarkIcon
                    onClick={() => setIsOpen(false)}
                    className="w-7 cursor-pointer"
                  />
                </div>
                <div className="w-full  bg-[#0C0C0C] border border-[#1C1C1C] gap-4 px-4 py-4 rounded-xl mt-6 mb-6">
                  <div className="flex justify-between items-center">
                  <div className="text-3xl font-medium">
                    {sliderValue}%
                    </div>
                    <div className="flex items-center gap-x-4">
                      <button onClick={() => handleSliderButton(25)} className="bg-black p-2 rounded-lg border border-grey1 hover:text-main hover:bg-background hover:border-transparent transition-all cursor-pointer">
                        25%
                      </button>
                      <button onClick={() => handleSliderButton(50)} className="bg-black p-2 rounded-lg border border-grey1 hover:text-main hover:bg-background hover:border-transparent transition-all cursor-pointer">
                        50%
                      </button>
                      <button onClick={() => handleSliderButton(75)} className="bg-black p-2 rounded-lg border border-grey1 hover:text-main hover:bg-background hover:border-transparent transition-all cursor-pointer">
                        75%
                      </button>
                      <button onClick={() => handleSliderButton(100)} className="bg-black p-2 rounded-lg border border-grey1 hover:text-main hover:bg-background hover:border-transparent transition-all cursor-pointer">
                        100%
                      </button>
                    </div>
                    </div>
        <input
          autoComplete="off"
          type="range"
          min="1"
          max="100"
          value={sliderValue}
          onChange={handleChange}
          className="w-full styled-slider slider-progress bg-transparent mt-6"
        />
                </div>
                <div className="w-full items-center justify-between flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl mt-6 mb-6">
                  <div className=" p-2 ">{inputBox("0")}</div>
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
                           <button onClick={() => handleSliderButton(100)}
              className="text-grey text-xs bg-dark border border-grey1 px-4 py-1 rounded-md"
            >
              MAX
            </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full items-center justify-between flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl mt-6 mb-6">
                  <div className=" p-2 ">{Number(
                  tokenOrder
                    ? ethers.utils.formatUnits(amount1, 18)
                    : ethers.utils.formatUnits(amount0, 18)
                ).toPrecision(6)}</div>
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
                           <button onClick={() => handleSliderButton(100)}
              className="text-grey text-xs bg-dark border border-grey1 px-4 py-1 rounded-md"
            >
              MAX
            </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <RangeRemoveLiqButton
                    disabled={disabled}
                    poolAddress={poolAdd}
                    address={address}
                    lower={lowerTick}
                    upper={upperTick}
                    burnPercent={burnPercent}
                    gasLimit={gasLimit}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
