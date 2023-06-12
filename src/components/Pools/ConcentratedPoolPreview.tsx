import { Fragment, useEffect, useState } from 'react'
import { Transition, Dialog } from '@headlessui/react'
import RangeMintButton from '../Buttons/RangeMintButton'
import { BigNumber, ethers } from 'ethers'
import { erc20ABI, useAccount, useContractRead } from 'wagmi'
import { TickMath } from '../../utils/math/tickMath'
import RangeMintDoubleApproveButton from '../Buttons/RangeMintDoubleApproveButton'

export default function ConcentratedPoolPreview({
  account,
  poolAddress,
  tokenIn,
  tokenOut,
  amount0,
  amount1,
  amount0Usd,
  amount1Usd,
  lowerTick,
  upperTick,
  fee,
  allowance0,
  allowance1,
  disabled,
}) {
  const { address, isConnected } = useAccount()
  const tokenOrder = tokenIn.address.localeCompare(tokenOut.address) < 0
  const lowerPrice = TickMath.getPriceStringAtTick(lowerTick)
  const upperPrice = TickMath.getPriceStringAtTick(upperTick) 
  console.log('allowances', allowance0.toString(), allowance1.toString())

  let [isOpen, setIsOpen] = useState(false)

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  return (
    <div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
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
                <Dialog.Panel className="w-[55rem] text-white text-left overflow-hidden rounded-xl shadow-xl transition-all">
                  <div className="bg-black flex gap-x-20 justify-between border border-grey2 w-full rounded-xl py-6 px-7">
                    <div className="w-1/2">
                      <div>
                        <div className="flex items-center gap-x-4">
                          <h1>Pair</h1>
                        </div>
                        <div className="flex items-center gap-x-5 mt-3">
                          <button className="flex items-center gap-x-3 bg-black border border-grey1 px-4 py-1.5 rounded-xl">
                            <img className="w-7" src={tokenIn.logoURI} />
                            {tokenIn.symbol}
                          </button>
                          <button className="flex items-center gap-x-3 bg-black border border-grey1 px-4 py-1.5 rounded-xl">
                            <img className="w-7" src={tokenOut.logoURI} />
                            {tokenOut.symbol}
                          </button>
                        </div>
                      </div>
                      <div>
                        <div className="gap-x-4 mt-8">
                          <h1>Fee tier</h1>
                        </div>
                        <div className="mt-3">
                          <button className="relative cursor-default rounded-lg bg-black text-white cursor-pointer border border-grey1 py-2 pl-3 w-full text-left shadow-md focus:outline-none">
                            <span className="block truncate">{fee}</span>
                            <span className="block truncate text-xs text-grey mt-1">
                              Best for most pairs
                            </span>
                          </button>
                        </div>
                      </div>
                      <div>
                        <div className="gap-x-4 mt-8">
                          <h1>Deposited amounts</h1>
                        </div>
                        <div className="mt-3 space-y-3">
                          <div className="w-full items-center justify-between flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
                            <div className=" p-2 ">
                              <div className="w-44 bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl">
                                {ethers.utils.formatUnits(amount0, 18)}
                              </div>
                              <div className="flex">
                                <div className="flex text-xs text-[#4C4C4C]">
                                  ${amount0Usd.toFixed(2)}
                                </div>
                              </div>
                            </div>
                            <div className="">
                              <div className=" ml-auto">
                                <div>
                                  <div className="flex justify-end">
                                    <button className="flex items-center gap-x-3 bg-black border border-grey1 px-3 py-1.5 rounded-xl ">
                                      <div className="flex items-center gap-x-2 w-full">
                                        <img
                                          className="w-7"
                                          src={tokenIn.logoURI}
                                        />
                                        {tokenIn.symbol}
                                      </div>
                                    </button>
                                  </div>
                                  <div className="flex items-center justify-end gap-x-2 px-1 mt-2 ">
                                    <div className="text-xs text-dark">-</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="w-full items-center justify-between flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
                            <div className=" p-2 ">
                              <div className="w-44 bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl">
                                {ethers.utils.formatUnits(amount1, 18)}
                              </div>
                              <div className="flex">
                                <div className="flex text-xs text-[#4C4C4C]">
                                  ${amount1Usd.toFixed(2)}
                                </div>
                              </div>
                            </div>
                            <div className="">
                              <div className=" ml-auto">
                                <div>
                                  <div className="flex justify-end">
                                    <button className="flex items-center gap-x-3 bg-black border border-grey1 px-3 py-1.5 rounded-xl ">
                                      <div className="flex items-center gap-x-2 w-full">
                                        <img
                                          className="w-7"
                                          src={tokenOut.logoURI}
                                        />
                                        {tokenOut.symbol}
                                      </div>
                                    </button>
                                  </div>
                                  <div className="flex items-center justify-end gap-x-2 px-1 mt-2">
                                    <div className="text-xs text-dark">-</div>
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
                          <h1>Price range</h1>
                        </div>
                        <div className="mt-3 space-y-3">
                          <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
                            <span className="text-xs text-grey">Min Price</span>
                            <div className="flex justify-center items-center">
                              <span className="text-lg py-2 outline-none text-center">
                                {lowerPrice.toString().includes('e')
                                  ? parseFloat(lowerPrice).toLocaleString(undefined, {
                                      maximumFractionDigits: 0,
                                    }).length > 6
                                    ? '0'
                                    : parseFloat(lowerPrice).toLocaleString(undefined, {
                                        maximumFractionDigits: 0,
                                      })
                                  : lowerPrice}
                              </span>
                            </div>
                            <span className="text-xs text-grey">
                              {tokenOrder ? tokenOut.symbol : tokenIn.symbol}{" "}
                              per{" "}
                              {tokenOrder ? tokenIn.symbol : tokenOut.symbol}
                            </span>
                          </div>
                          <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
                            <span className="text-xs text-grey">Max Price</span>
                            <div className="flex justify-center items-center">
                              <span className="text-lg py-2 outline-none text-center">
                                {upperPrice.toString().includes('e')
                                  ? Number(upperPrice).toLocaleString(undefined, {
                                      maximumFractionDigits: 0,
                                    }).length > 6
                                    ? '∞'
                                    : Number(upperPrice).toLocaleString(undefined, {
                                        maximumFractionDigits: 0,
                                      })
                                  : upperPrice}
                              </span>
                            </div>
                            <span className="text-xs text-grey">
                              {tokenOrder ? tokenOut.symbol : tokenIn.symbol}{" "}
                              per{" "}
                              {tokenOrder ? tokenIn.symbol : tokenOut.symbol}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='mt-4'>
                        {allowance0.gte(amount0) &&
                        allowance1.gte(amount1) ? null : (
                          <RangeMintDoubleApproveButton
                            poolAddress={poolAddress}
                            token0={tokenOrder ? tokenIn : tokenOut}
                            token1={tokenOrder ? tokenOut : tokenIn}
                            amount0={amount0}
                            amount1={amount1}
                            approveZero={allowance0.lt(amount0)}
                          />
                        )}
                        {allowance0.lt(amount0) ||
                        allowance1.lt(amount1) ? null : (
                          <RangeMintButton
                            to={address}
                            poolAddress={poolAddress}
                            lower={lowerTick}
                            upper={upperTick}
                            disabled={
                              allowance0.lt(amount0) || allowance1.lt(amount1)
                            }
                            amount0={amount0}
                            amount1={amount1}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <button
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="mt-8 w-full py-4 disabled:opacity-50 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
      >
        Preview
      </button>
    </div>
  );
}
