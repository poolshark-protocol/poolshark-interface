import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useEffect, useState } from 'react'
import { XMarkIcon } from "@heroicons/react/20/solid";
import { useSwitchNetwork } from "wagmi";
import useInputBox from '../../../hooks/useInputBox'
import AddLiqButton from '../../Buttons/AddLiqButton'


export default function CoverRemoveLiquidity({ isOpen, setIsOpen, tokenIn, poolAdd, address, claimTick, maxLimit, zeroForOne, liquidity, minLimit }) {

    const {
    bnInput,
    inputBox,
    maxBalance,
    bnInputLimit,
    LimitInputBox,
  } = useInputBox()

    const [balance0, setBalance0] = useState('')
  const [balance1, setBalance1] = useState('0.00')

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
                      lower={minLimit}
                      claim={claimTick}
                      upper={maxLimit}
                      zeroForOne={zeroForOne}
                      amount={liquidity}
                    />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
