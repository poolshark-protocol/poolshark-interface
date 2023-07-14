import { Fragment, useEffect, useState } from "react";
import { Transition, Dialog } from "@headlessui/react";
import RangeMintButton from "../Buttons/RangeMintButton";
import { BigNumber, ethers } from "ethers";
import { erc20ABI, useAccount, useContractRead, useProvider } from "wagmi";
import { TickMath } from "../../utils/math/tickMath";
import RangeMintDoubleApproveButton from "../Buttons/RangeMintDoubleApproveButton";
import { useRouter } from "next/router";
import { ArrowLongRightIcon } from "@heroicons/react/20/solid";
import { gasEstimateRangeMint, gasEstimateSwapLimit } from "../../utils/gas";
import RangeMintApproveButton from "../Buttons/RangeMintApproveButton";
import { useRangeStore } from "../../hooks/useRangeStore";

export default function ConcentratedPoolPreview({}) {

  const [
    rangePoolAddress,
    rangePoolData,
    setRangePoolAddress,
    setRangePoolData,
    tokenIn,
    tokenInRangeUSDPrice,
    tokenInBalance,
    tokenInAllowance,
    setTokenIn,
    setTokenInRangeUSDPrice,
    setTokenInBalance,
    setTokenInAllowance,
    tokenOut,
    tokenOutRangeUSDPrice,
    tokenOutBalance,
    tokenOutAllowance,
    setTokenOut,
    setTokenOutRangeUSDPrice,
    setTokenOutBalance,
    setTokenOutAllowance,
    minTick,
    maxTick,
    pairSelected,
  ] = useRangeStore((state) => [
    state.rangePoolAddress,
    state.rangePoolData,
    state.setRangePoolAddress,
    state.setRangePoolData,
    state.tokenIn,
    state.tokenInRangeUSDPrice,
    state.tokenInBalance,
    state.tokenInRangeAllowance,
    state.setTokenIn,
    state.setTokenInRangeUSDPrice,
    state.setTokenInBalance,
    state.setTokenInRangeAllowance,
    state.tokenOut,
    state.tokenOutRangeUSDPrice,
    state.tokenOutBalance,
    state.tokenOutRangeAllowance,
    state.setTokenOut,
    state.setTokenOutRangeUSDPrice,
    state.setTokenOutBalance,
    state.setTokenOutRangeAllowance,
    state.minTick,
    state.maxTick,
    state.pairSelected,
  ]);

  const rangePoolRoute = rangePoolAddress as `0x${string}`

  const { address, isConnected } = useAccount();
  const router = useRouter();
  const tokenOrder = tokenIn.address.localeCompare(tokenOut.address) < 0;
  const minPrice = TickMath.getPriceStringAtTick(minTick);
  const maxPrice = TickMath.getPriceStringAtTick(maxTick);
  const provider = useProvider();
  const signer = new ethers.VoidSigner(address, provider);

  const [isOpen, setIsOpen] = useState(false);
  const [doubleApprove, setdoubleApprove] = useState(false);

  const { data: allowanceInRange } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, rangePoolRoute],
    chainId: 421613,
    watch: true,
    enabled: rangePoolRoute != undefined && (tokenIn.address).toString() != "",
    onSuccess(data) {
      console.log("Success allowance", data);
    },
    onError(error) {
      console.log("Error", error);
    },
  });

  const { data: allowanceOutRange } = useContractRead({
    address: tokenOut.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, rangePoolRoute],
    chainId: 421613,
    watch: true,
    enabled: rangePoolRoute != undefined && (tokenIn.address).toString() != "",
    onSuccess(data) {
      console.log("Success allowance", data);
    },
    onError(error) {
      console.log("Error", error);
    },
  });

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
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
                <Dialog.Panel className="max-w-[55rem] w-full text-white text-left overflow-hidden rounded-xl shadow-xl transition-all">
                  <div className="bg-black flex md:flex-row flex-col gap-x-20 justify-between border border-grey2 w-full rounded-xl py-6 px-7">
                    <div className="md:w-1/2">
                      <div>
                        <div className="flex items-center gap-x-4">
                          <h1>Pair</h1>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-x-5 gap-y-3 mt-3 w-full">
                          <button className="flex w-full items-center gap-x-3 bg-black border border-grey1 px-4 py-1.5 rounded-xl">
                            <img className="w-7" src={tokenIn.logoURI} />
                            {tokenIn.symbol}
                          </button>
                          <button className="flex w-full items-center gap-x-3 bg-black border border-grey1 px-4 py-1.5 rounded-xl">
                            <img
                              className="w-7 w-full"
                              src={tokenOut.logoURI}
                            />
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
                              <div className="w-full bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl">
                                {parseFloat(
                                  ethers.utils.formatUnits(
                                    amountIn,
                                    18
                                  )
                                ).toFixed(3)}
                              </div>
                              <div className="flex">
                                <div className="flex text-xs text-[#4C4C4C]">
                                  ${tokenInRangeUSDPrice.toFixed(2)}
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
                              <div className="w-full bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl">
                                {parseFloat(
                                  ethers.utils.formatUnits(
                                    amountOut,
                                    18
                                  )
                                ).toFixed(3)}
                              </div>
                              <div className="flex">
                                <div className="flex text-xs text-[#4C4C4C]">
                                  ${tokenOutRangeUSDPrice.toFixed(2)}
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
                    <div className="md:w-1/2 mt-10">
                      <div>
                        <div className="flex justify-between items-center">
                          <h1>Price range</h1>
                        </div>
                        <div className="mt-3 space-y-3">
                          <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
                            <span className="md:text-xs text-[10px] text-grey">
                              Min. Price
                            </span>
                            <div className="flex justify-center items-center">
                              <span className="text-lg py-2 outline-none text-center">
                                {minPrice}
                              </span>
                            </div>
                            <span className="md:text-xs text-[10px] text-grey">
                              {tokenOut.symbol} per {tokenIn.symbol}
                            </span>
                          </div>
                          <div className="bg-[#0C0C0C] border border-[#1C1C1C] flex-col flex text-center p-3 rounded-lg">
                            <span className="md:text-xs text-[10px] text-grey">
                              Max. Price
                            </span>
                            <div className="flex justify-center items-center">
                              <span className="text-lg py-2 outline-none text-center">
                                {maxPrice}
                              </span>
                            </div>
                            <span className="md:text-xs text-[10px] text-grey">
                              {tokenOut.symbol} per {tokenIn.symbol}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        {tokenInAllowance.gte(amount0) && tokenOutAllowance.gte(amount1) ? (
                          <RangeMintButton
                            to={address}
                            poolAddress={rangePoolAddress}
                            lower={minPrice}
                            upper={maxPrice}
                            disabled={
                              tokenInAllowance.lt(amount0) ||
                              tokenOutAllowance.lt(amount1) ||
                              gasFee._hex === "0x00"
                            }
                            amount0={amount0}
                            amount1={amount1}
                            gasLimit={gasLimit}
                            closeModal={() => router.push("/pool")}
                          />
                        ) : (tokenInAllowance.lt(amount0) &&
                             tokenOutAllowance.lt(amount1)) ||
                          doubleApprove ? (
                          <RangeMintDoubleApproveButton
                            poolAddress={rangePoolAddress}
                            tokenIn={tokenIn}
                            tokenOut={tokenOut}
                            setAllowanceController={setdoubleApprove}
                          />
                        ) : !doubleApprove && tokenInAllowance.lt(amount0) ? (
                          <RangeMintApproveButton
                            poolAddress={rangePoolAddress}
                            approveToken={tokenIn}
                          />
                        ) : !doubleApprove && tokenOutAllowance.lt(amount1) ? (
                          <RangeMintApproveButton
                            poolAddress={rangePoolAddress}
                            approveToken={tokenOut}
                          />
                        ) : null}
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
        className="mt-8 w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed mx-auto font-medium text-center transition rounded-xl bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
      >
        {disabled ? (
          <>
            {buttonState === "price" ? (
              <>Min. is greater than Max. Price</>
            ) : (
              <></>
            )}
            {buttonState === "amount" ? <>Input Deposit Amount</> : <></>}
            {/* {buttonState === 'balance0' ? <>Insufficient {tokenZeroSymbol}  Balance</> : <></>}
            {buttonState === 'balance1' ? <>Insufficient {tokenOneSymbol} Balance</> : <></>} */}
          </>
        ) : (
          <>Preview</>
        )}
      </button>
    </div>
  );
}
