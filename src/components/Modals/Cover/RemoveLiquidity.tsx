import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useEffect, useState } from 'react'
import { XMarkIcon } from "@heroicons/react/20/solid";
import { erc20ABI } from "wagmi";
import useInputBox from '../../../hooks/useInputBox'
import CoverRemoveLiqButton from "../../Buttons/CoverRemoveLiqButton";
import { BigNumber, ethers } from "ethers";
import { BN_ZERO } from "../../../utils/math/constants";

export default function CoverRemoveLiquidity({ isOpen, setIsOpen, tokenIn, poolAdd, address, claimTick, lowerTick, zeroForOne, amountInDeltaMax, upperTick, gasLimit, gasFee }) {

  const {
    bnInput,
    inputBox,
    setDisplay,
  } = useInputBox()

  const [balanceIn, setBalanceIn] = useState('')
  const [fetchDelay, setFetchDelay] = useState(false)
  const [burnPercent, setBurnPercent] = useState(ethers.utils.parseUnits("5", 37))
  const [sliderValue, setSliderValue] = useState(0)
  const [amountInMax, setAmountInMax] = useState(ethers.utils.parseUnits(amountInDeltaMax ?? '0', 0))
  const [amountInDisplay, setAmountInDisplay] = useState(ethers.utils.formatUnits(BigNumber.from(amountInDeltaMax) ?? BN_ZERO, tokenIn.decimals))

  useEffect(() => {
    if(!fetchDelay) {
      getBalances()
    } else {
      const interval = setInterval(() => {
        getBalances()
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [fetchDelay])

  useEffect(() => {
    if (amountInMax.gt(BN_ZERO)) {
      console.log('setting burn percent bn input', bnInput.toString(), amountInMax.toString(), bnInput.mul(ethers.utils.parseUnits('1', 38)).div(amountInMax).toString())
      setBurnPercent(bnInput.mul(ethers.utils.parseUnits('1', 38)).div(amountInMax))
    }
  }, [bnInput])

  useEffect(() => {
    if (sliderValue == 0) {
      setDisplay('')
      return
    } 
    setBurnPercent(ethers.utils.parseUnits(String(sliderValue), 36))
    console.log('setting burn percent', ethers.utils.parseUnits(String(sliderValue), 36).toString())
    console.log('setting display', amountInMax)
    setDisplay((parseFloat(amountInDisplay) * sliderValue / 100).toPrecision(6))
  }, [sliderValue])

  const handleChange = (event: any) => {
    setSliderValue(event.target.value)
  }
  
  const handleSliderButton = (percent: number) => {
    setSliderValue(percent)
  }

  const getBalances = async () => {
    setFetchDelay(true)
    console.log('tokenIn remove liquidity', tokenIn)
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        'https://arb-goerli.g.alchemy.com/v2/M8Dr_KQx46ghJ93XDQe7j778Qa92HRn2',
        421613,
      )
      const signer = new ethers.VoidSigner(address, provider)
      const tokenInContract = new ethers.Contract(tokenIn.address, erc20ABI, signer)
      const tokenInBal = await tokenInContract.balanceOf(address)
      setBalanceIn(ethers.utils.formatUnits(tokenInBal, 18))
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
          min="0"
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
                <CoverRemoveLiqButton
                      disabled={parseFloat(gasFee) == 0}
                      poolAddress={poolAdd}
                      address={address}
                      lower={lowerTick}
                      claim={claimTick}
                      upper={upperTick}
                      zeroForOne={zeroForOne}
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
