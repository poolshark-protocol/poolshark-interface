import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useEffect, useState } from 'react'
import { XMarkIcon } from "@heroicons/react/20/solid";
import { useSwitchNetwork, useAccount  } from "wagmi";
import useInputBox from '../../../hooks/useInputBox'
import RangeAddLiqButton from '../../Buttons/RangeAddLiqButton'


export default function CoverAddLiquidity({ isOpen, setIsOpen, tokenIn, poolAdd, address, claimTick, maxLimit, zeroForOne, liquidity, minLimit }) {

    const {
    bnInput,
    inputBox,
    maxBalance,
    bnInputLimit,
    LimitInputBox,
  } = useInputBox()

  const [balance0, setBalance0] = useState('')
  const [balance1, setBalance1] = useState('0.00')
  const [balanceIn, setBalanceIn] = useState('')
  const { isDisconnected, isConnected } = useAccount()

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
                  <h1 className="text-lg">Add Liquidity</h1>
                  <XMarkIcon
                    onClick={() => setIsOpen(false)}
                    className="w-7 cursor-pointer"
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
                        <div className="flex items-center justify-end gap-2 px-1 mt-2">
                  <div className="flex text-xs text-[#4C4C4C]" key={balanceIn}>
                    Balance: {balanceIn === "NaN" ? 0 : balanceIn}
                  </div>
                    <button
                      className="flex text-xs uppercase text-[#C9C9C9]"
                      onClick={() => {
                        console.log("max", balanceIn);
                        maxBalance(balanceIn, "0");
                      }}
                    >
                      Max
                    </button>
                </div>
                      </div>
                    </div>
                  </div>
                </div>
                <RangeAddLiqButton
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
