import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useEffect, useState } from 'react'
import { XMarkIcon } from "@heroicons/react/20/solid";
import RangeRemoveLiqButton from "../../Buttons/RangeRemoveLiqButton";
import { BigNumber, ethers } from "ethers";
import { BN_ZERO, ZERO } from "../../../utils/math/constants";
import JSBI from "jsbi";
import { DyDxMath } from "../../../utils/math/dydxMath";
import { TickMath } from "../../../utils/math/tickMath";
import { useRouter } from "next/router";
import { useRangeStore } from "../../../hooks/useRangeStore";

export default function RangeRemoveLiquidity({ isOpen, setIsOpen, address }) {
  const [
    rangePoolAddress,
    rangePositionData,
    tokenIn,
    tokenOut,
    tokenInRangeUSDPrice,
    tokenOutRangeUSDPrice
  ] = useRangeStore((state) => [
    state.rangePoolAddress,
    state.rangePositionData,
    state.tokenIn,
    state.tokenOut,
    state.tokenInRangeUSDPrice,
    state.tokenOutRangeUSDPrice
  ])
  
  const router = useRouter()

  const [sliderValue, setSliderValue] = useState(1)
  const [sliderOutput, setSliderOutput] = useState('1')
  const [burnPercent, setBurnPercent] = useState(BN_ZERO)
  const [amount0, setAmount0] = useState(BN_ZERO)
  const [amount1, setAmount1] = useState(BN_ZERO)
  const tokenOrder = tokenIn.address.localeCompare(tokenOut.address) < 0
  const [ rangeSqrtPrice, setRangeSqrtPrice ] = useState(JSBI.BigInt(rangePositionData.price))
  const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(Number(rangePositionData.min))
  const upperSqrtPrice = TickMath.getSqrtRatioAtTick(Number(rangePositionData.max))

  useEffect(() => {
    const percentInput = sliderValue
    const tokenAmountToBurn = BigNumber.from(percentInput).mul(BigNumber.from(rangePositionData.userTokenAmount)).div(BigNumber.from(100))
    setBurnPercent(ethers.utils.parseUnits(sliderValue.toString(), 36))
    console.log('new burn percent', ethers.utils.parseUnits(sliderValue.toString(), 36).toString())
    setAmounts(JSBI.BigInt(tokenAmountToBurn), true)
  }, [sliderValue])

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
        if (changeDisplay) setSliderOutput(Number(ethers.utils.formatUnits(tokenOrder ? amount0Bn : amount1Bn, 18)).toPrecision(6))
        setAmount0(amount0Bn) 
        setAmount1(amount1Bn)
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-black text-white border border-grey2 text-left align-middle shadow-xl py-4 px-3 md:p-5 transition-all">
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
                    <div className="md:flex items-center hidden md:text-base text-sm gap-x-4">
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
                <div className=" p-2 ">
                              <div className="w-full bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-1 rounded-xl">
                                <div
                                  id="input"
                                  className="bg-[#0C0C0C] placeholder:text-grey1 w-full text-white text-2xl mb-2 rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none"
                                >
                                  {sliderOutput}
                                </div>
                              </div>
                              <div className="flex">
                                <div className="flex text-xs text-[#4C4C4C]">
                                ${tokenOrder ? (Number(tokenInRangeUSDPrice * parseFloat(ethers.utils.formatUnits(amount0, 18))).toFixed(2)) : (Number(tokenOutRangeUSDPrice * parseFloat(ethers.utils.formatUnits(amount1, 18))).toFixed(2))}
                                
                                </div>
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
                <div className=" p-2 ">
                              <div className="w-full bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl">
                              {Number(
                  tokenOrder
                    ? ethers.utils.formatUnits(amount1, 18)
                    : ethers.utils.formatUnits(amount0, 18)
                ).toFixed(2)}
                              </div>
                              <div className="flex">
                                <div className="flex text-xs text-[#4C4C4C]">
                                ${tokenOrder ? (Number(tokenOutRangeUSDPrice * parseFloat(ethers.utils.formatUnits(amount1, 18))).toFixed(2)) : (Number(tokenInRangeUSDPrice * parseFloat(ethers.utils.formatUnits(amount0, 18))).toFixed(2))}
                                </div>
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
                    poolAddress={rangePoolAddress}
                    address={address}
                    lower={BigNumber.from(rangePositionData.min)}
                    upper={BigNumber.from(rangePositionData.max)}
                    burnPercent={burnPercent}
                    closeModal={() => 
                      {if (burnPercent.eq(ethers.utils.parseUnits('1', 38))) {
                        router.push('/pool')
                      }}}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
