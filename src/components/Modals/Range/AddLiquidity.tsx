import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import {
  useAccount,
  erc20ABI,
  useContractRead,
  useProvider,
  useBalance,
} from "wagmi";
import useInputBox from "../../../hooks/useInputBox";
import RangeAddLiqButton from "../../Buttons/RangeAddLiqButton";
import { BN_ZERO, ZERO } from "../../../utils/math/constants";
import { TickMath } from "../../../utils/math/tickMath";
import { ethers, BigNumber } from "ethers";
import JSBI from "jsbi";
import { DyDxMath } from "../../../utils/math/dydxMath";
import { chainIdsToNamesForGitTokenList } from "../../../utils/chains";
import RangeMintDoubleApproveButton from "../../Buttons/RangeMintDoubleApproveButton";
import RangeMintApproveButton from "../../Buttons/RangeMintApproveButton";
import { useRangeStore } from "../../../hooks/useRangeStore";

export default function RangeAddLiquidity({ isOpen, setIsOpen, address }) {
  const [
    rangePoolAddress,
    pairSelected,
    tokenIn,
    setTokenInBalance,
    tokenOut,
    setTokenOutBalance,
    rangePositionData,
    needsAllowanceIn,
    setNeedsAllowanceIn,
    needsAllowanceOut,
    setNeedsAllowanceOut,
    needsBalanceIn,
    setNeedsBalanceIn,
    needsBalanceOut,
    setNeedsBalanceOut,
  ] = useRangeStore((state) => [
    state.rangePoolAddress,
    state.pairSelected,
    state.tokenIn,
    state.setTokenInBalance,
    state.tokenOut,
    state.setTokenOutBalance,
    state.rangePositionData,
    state.needsAllowanceIn,
    state.setNeedsAllowanceIn,
    state.needsAllowanceOut,
    state.setNeedsAllowanceOut,
    state.needsBalanceIn,
    state.setNeedsBalanceIn,
    state.needsBalanceOut,
    state.setNeedsBalanceOut,
  ]);

  const { bnInput, maxBalance, inputBox } = useInputBox();
  const [amount0, setAmount0] = useState(BN_ZERO);
  const [amount1, setAmount1] = useState(BN_ZERO);
  const [disabled, setDisabled] = useState(false);
  const [allowanceIn, setAllowanceIn] = useState(BN_ZERO);
  const [allowanceOut, setAllowanceOut] = useState(BN_ZERO);
  const lowerSqrtPrice = TickMath.getSqrtRatioAtTick(
    Number(rangePositionData.min)
  );
  const upperSqrtPrice = TickMath.getSqrtRatioAtTick(
    Number(rangePositionData.max)
  );
  const [stateChainName, setStateChainName] = useState();
  const [tokenOrder, setTokenOrder] = useState(
    tokenIn.address.localeCompare(tokenOut.address) < 0
  );
  const { isConnected } = useAccount();
  const [rangeSqrtPrice, setRangeSqrtPrice] = useState(
    JSBI.BigInt(rangePositionData.price)
  );
  const [doubleApprove, setdoubleApprove] = useState(false);
  const [buttonState, setButtonState] = useState("");
  const {
    network: { chainId },
  } = useProvider();

  const { data: tokenInAllowance } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, rangePoolAddress],
    chainId: 421613,
    watch: needsAllowanceIn,
    enabled:
      isConnected &&
      rangePoolAddress != undefined &&
      tokenIn.address != undefined &&
      needsAllowanceIn,
    onSuccess(data) {
      console.log("Success");
      setNeedsAllowanceIn(false);
    },
    onError(error) {
      console.log("Error", error);
    },
    onSettled(data, error) {
      console.log(
        "allowance check",
        allowanceIn.lt(bnInput),
        allowanceIn.toString()
      );
      console.log("Allowance Settled", {
        data,
        error,
        rangePoolAddress,
        tokenIn,
      });
    },
  });

  useEffect(() => {
    if (tokenInAllowance) setAllowanceIn(tokenInAllowance);
  }, [tokenInAllowance]);

  const { data: tokenOutAllowance } = useContractRead({
    address: tokenOut.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, rangePoolAddress],
    chainId: 421613,
    watch: needsAllowanceOut,
    enabled:
      isConnected &&
      rangePoolAddress != undefined &&
      tokenOut.address != undefined &&
      needsAllowanceOut,
    onSuccess(data) {
      console.log("Success");
      setNeedsAllowanceOut(false);
    },
    onError(error) {
      console.log("Error", error);
    },
    onSettled(data, error) {
      console.log(
        "allowance check out",
        allowanceOut.lt(amount1),
        allowanceOut.toString()
      );
      console.log("Allowance Settled", {
        data,
        error,
        rangePoolAddress,
        tokenIn,
      });
    },
  });

  useEffect(() => {
    if (tokenOutAllowance) {
      console.log("token out allowance check", tokenOutAllowance.toString());
      setAllowanceOut(tokenOutAllowance);
    }
  }, [tokenOutAllowance]);

  useEffect(() => {
    setAmounts();
  }, [bnInput]);

  useEffect(() => {
    setStateChainName(chainIdsToNamesForGitTokenList[chainId]);
  }, [chainId]);

  ////////////////////////////////Balances

  const { data: tokenInBal } = useBalance({
    address: address,
    token: tokenIn.address,
    enabled: tokenIn.address != undefined && needsBalanceIn,
    watch: needsBalanceIn,
    onSuccess(data) {
      setNeedsBalanceIn(false);
    },
  });

  const { data: tokenOutBal } = useBalance({
    address: address,
    token: tokenOut.address,
    enabled: tokenOut.address != undefined && needsBalanceOut,
    watch: needsBalanceOut,
    onSuccess(data) {
      setNeedsBalanceOut(false);
    },
  });

  useEffect(() => {
    if (isConnected) {
      setTokenInBalance(
        parseFloat(tokenInBal?.formatted.toString()).toFixed(2)
      );
      if (pairSelected) {
        setTokenOutBalance(
          parseFloat(tokenOutBal?.formatted.toString()).toFixed(2)
        );
      }
    }
  }, [tokenInBal, tokenOutBal]);

  //////////////////////////////

  // disabled messages
  useEffect(() => {
    if (
      Number(ethers.utils.formatUnits(bnInput, tokenIn.decimals)) >
      Number(tokenIn.userBalance)
    ) {
      setButtonState("balance0");
    }
    if (
      Number(ethers.utils.formatUnits(amount1, tokenIn.decimals)) >
      Number(tokenOut.userBalance)
    ) {
      setButtonState("balance1");
    }
    if (Number(ethers.utils.formatUnits(bnInput, tokenIn.decimals)) === 0) {
      setButtonState("amount");
    }
    if (
      Number(ethers.utils.formatUnits(bnInput, tokenIn.decimals)) === 0 ||
      Number(ethers.utils.formatUnits(bnInput, tokenIn.decimals)) >
      Number(tokenIn.userBalance) ||
      Number(ethers.utils.formatUnits(amount1, tokenIn.decimals)) >
      Number(tokenOut.userBalance)
      
    ) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [bnInput, tokenIn.userBalance, tokenOut.userBalance, disabled]);

  function setAmounts() {
    try {
      if (Number(ethers.utils.formatUnits(bnInput)) !== 0) {
        const liquidity =
          JSBI.greaterThanOrEqual(rangeSqrtPrice, lowerSqrtPrice) &&
          JSBI.lessThanOrEqual(rangeSqrtPrice, upperSqrtPrice)
            ? DyDxMath.getLiquidityForAmounts(
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
              );
        console.log("liquidity check", liquidity);
        const tokenOutAmount = JSBI.greaterThan(liquidity, ZERO)
          ? tokenOrder
            ? DyDxMath.getDy(liquidity, lowerSqrtPrice, rangeSqrtPrice, true)
            : DyDxMath.getDx(liquidity, rangeSqrtPrice, upperSqrtPrice, true)
          : ZERO;
        // set amount based on bnInput
        tokenOrder ? setAmount0(bnInput) : setAmount1(bnInput);
        // set amount based on liquidity math
        tokenOrder
          ? setAmount1(BigNumber.from(String(tokenOutAmount)))
          : setAmount0(BigNumber.from(String(tokenOutAmount)));
        setDisabled(false);
      } else {
        setAmount1(BN_ZERO);
        setAmount0(BN_ZERO);
        setDisabled(true);
      }
    } catch (error) {
      console.log(error);
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
                <div className="flex items-center justify-between px-2 mb-5">
                  <h1 className="text-lg">Add Liquidity</h1>
                  <XMarkIcon
                    onClick={() => setIsOpen(false)}
                    className="w-7 cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-y-3 mb-5">
                  <div className="w-full items-center justify-between flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
                    <div className=" p-2 w-32">
                      <div className="w-full bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-1 rounded-xl">
                        {inputBox("0")}
                      </div>
                      <div className="flex">
                        <div className="flex text-xs text-[#4C4C4C]">
                          $
                          {tokenOrder
                            ? Number(
                                tokenOut.rangeUSDPrice *
                                  parseFloat(
                                    ethers.utils.formatUnits(
                                      amount1,
                                      tokenIn.decimals
                                    )
                                  )
                              ).toFixed(2)
                            : Number(
                                tokenIn.rangeUSDPrice *
                                  parseFloat(
                                    ethers.utils.formatUnits(
                                      amount0,
                                      tokenIn.decimals
                                    )
                                  )
                              ).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="">
                      <div className=" ml-auto">
                        <div>
                          <div className="flex justify-end">
                            <button className="flex items-center gap-x-3 bg-black border border-grey1 px-3 py-1.5 rounded-xl">
                              <img className="w-7" src={tokenIn.logoURI} />
                              {tokenIn.symbol}
                            </button>
                          </div>
                          <div className="flex items-center justify-end gap-2 px-1 mt-2">
                            <div
                              className="flex whitespace-nowrap md:text-xs text-[10px] whitespace-nowrap text-[#4C4C4C]"
                              key={tokenIn.userBalance}
                            >
                              Balance:{" "}
                              {tokenIn.userBalance ? 0 : tokenIn.userBalance}
                            </div>
                            <button
                              className="flex md:text-xs text-[10px] uppercase text-[#C9C9C9]"
                              onClick={() =>
                                maxBalance(tokenIn.userBalance, "0")
                              }
                            >
                              Max
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full items-center justify-between flex bg-[#0C0C0C] border border-[#1C1C1C] gap-4 p-2 rounded-xl ">
                    <div className=" p-2 ">
                      <div className="w-full bg-[#0C0C0C] placeholder:text-grey1 text-white text-2xl mb-2 rounded-xl">
                        {Number(
                          tokenOrder
                            ? ethers.utils.formatUnits(
                                amount1,
                                tokenIn.decimals
                              )
                            : ethers.utils.formatUnits(
                                amount0,
                                tokenIn.decimals
                              )
                        ).toFixed(2)}
                      </div>
                      <div className="flex">
                        <div className="flex text-xs text-[#4C4C4C]">
                          $
                          {tokenOrder
                            ? Number(
                                tokenIn.rangeUSDPrice *
                                  parseFloat(
                                    ethers.utils.formatUnits(
                                      amount0,
                                      tokenIn.decimals
                                    )
                                  )
                              ).toFixed(2)
                            : Number(
                                tokenOut.rangeUSDPrice *
                                  parseFloat(
                                    ethers.utils.formatUnits(
                                      amount1,
                                      tokenIn.decimals
                                    )
                                  )
                              ).toFixed(2)}
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
                          <div className="flex whitespace-nowrap items-center justify-end gap-x-2 px-1 mt-2">
                            <div
                              className="flex md:text-xs text-[10px] text-[#4C4C4C]"
                              key={tokenOut.userBalance}
                            >
                              Balance:{" "}
                              {tokenOut.userBalance ? 0 : tokenOut.userBalance}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {disabled === true ? (
                    <button className="opacity-50 w-full cursor-not-allowed py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF]">
                      {buttonState === "amount" ? <>Input Amount</> : <></>}
                      {buttonState === "balance0" ? (
                        <>Insufficient {tokenIn.symbol} Balance</>
                      ) : (
                        <></>
                      )}
                      {buttonState === "balance1" ? (
                        <>Insufficient {tokenOut.symbol} Balance</>
                      ) : (
                        <></>
                      )}
                    </button>
                  ) : (
                    <>
                      {allowanceIn.gte(amount0) && allowanceOut.gte(amount1) ? (
                        <RangeAddLiqButton
                          poolAddress={rangePoolAddress}
                          address={address}
                          lower={BigNumber.from(rangePositionData.min)}
                          upper={BigNumber.from(rangePositionData.max)}
                          amount0={amount0}
                          amount1={amount1}
                          disabled={disabled}
                          setIsOpen={setIsOpen}
                          positionId={0} //TODO: grab existing positionId from Subgraph
                        />
                      ) : (allowanceIn.lt(amount0) &&
                          allowanceOut.lt(amount1)) ||
                        doubleApprove ? (
                        <RangeMintDoubleApproveButton
                          poolAddress={rangePoolAddress}
                          tokenIn={tokenIn}
                          tokenOut={tokenOut}
                          amount0={amount0}
                          amount1={amount1}
                          setAllowanceController={setdoubleApprove}
                        />
                      ) : !doubleApprove && allowanceIn.lt(amount0) ? (
                        <RangeMintApproveButton
                          poolAddress={rangePoolAddress}
                          approveToken={tokenIn}
                          amount={amount0}
                        />
                      ) : !doubleApprove && allowanceOut.lt(amount1) ? (
                        <RangeMintApproveButton
                          poolAddress={rangePoolAddress}
                          approveToken={tokenOut}
                          amount={amount1}
                        />
                      ) : null}
                    </>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
