import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useEffect, useState } from 'react'
import { XMarkIcon } from "@heroicons/react/20/solid";
import { erc20ABI } from "wagmi";
import useInputBox from '../../../hooks/useInputBox'
import CoverRemoveLiqButton from "../../Buttons/CoverRemoveLiqButton";
import { BigNumber, ethers } from "ethers";
import { DyDxMath } from "../../../utils/math/dydxMath";
import { TickMath } from "../../../utils/math/tickMath";
import { BN_ZERO, ZERO } from "../../../utils/math/constants";
import JSBI from "jsbi";

export default function CoverRemoveLiquidity({ isOpen, setIsOpen, tokenIn, poolAdd, address, claimTick, lowerTick, zeroForOne, liquidity, upperTick }) {

  const {
    bnInput,
    inputBox,
    maxBalance,
    bnInputLimit,
    LimitInputBox,
  } = useInputBox()

  const [balanceIn, setBalanceIn] = useState('')
  const [fetchDelay, setFetchDelay] = useState(false)
  const [burnPercent, setBurnPercent] = useState(ethers.utils.parseUnits("5", 37))
  const [userLiquidity, setUserLiquidity] = useState(JSBI.BigInt(parseInt(liquidity)))
  const [amountOut, setAmountOut] = useState()

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
    changeOutAmount()
  }, [bnInput])

  const getBalances = async () => {
    setFetchDelay(true)
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

  const changeOutAmount = () => {
    if (bnInput.eq(BN_ZERO)) return
    try {
      const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(zeroForOne ? lowerTick : claimTick)
      const upperSqrtPrice = TickMath.getSqrtRatioAtTick(zeroForOne ? claimTick : upperTick)
      const liquidityTakenOut = DyDxMath.getLiquidityForAmounts(
        lowerSqrtPrice,
        upperSqrtPrice,
        zeroForOne ? lowerSqrtPrice : upperSqrtPrice,
        zeroForOne ? BN_ZERO : bnInput,
        zeroForOne ? bnInput : BN_ZERO
      )
      console.log('liquidity taken out', String(liquidityTakenOut), userLiquidity.toString())
      setBurnPercent(ethers.utils.parseUnits((parseFloat(String(liquidityTakenOut)) / parseFloat(String(userLiquidity))).toPrecision(6), 38))
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
                    100%
                    </div>
                    <div className="flex items-center gap-x-4">
                      <div className="bg-black p-2 rounded-lg border border-grey1 hover:text-main hover:bg-background hover:border-transparent transition-all cursor-pointer">
                        25%
                      </div>
                      <div className="bg-black p-2 rounded-lg border border-grey1 hover:text-main hover:bg-background hover:border-transparent transition-all cursor-pointer">
                        50%
                      </div>
                      <div className="bg-black p-2 rounded-lg border border-grey1 hover:text-main hover:bg-background hover:border-transparent transition-all cursor-pointer">
                        75%
                      </div>
                      <div className="bg-black p-2 rounded-lg border border-grey1 hover:text-main hover:bg-background hover:border-transparent transition-all cursor-pointer">
                        100%
                      </div>
                    </div>
                    </div>
        <input
          autoComplete="off"
          type="range"
          min="0"
          max="100"
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
                           <button
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
                      poolAddress={poolAdd}
                      address={address}
                      lower={lowerTick}
                      claim={claimTick}
                      upper={upperTick}
                      zeroForOne={zeroForOne}
                      burnPercent={burnPercent}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
