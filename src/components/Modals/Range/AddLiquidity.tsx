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
import {
  chainIdsToNamesForGitTokenList,
  chainProperties,
} from "../../../utils/chains";
import RangeMintDoubleApproveButton from "../../Buttons/RangeMintDoubleApproveButton";
import RangeMintApproveButton from "../../Buttons/RangeMintApproveButton";
import { useRangeLimitStore } from "../../../hooks/useRangeLimitStore";
import { gasEstimateRangeMint } from "../../../utils/gas";
import { Router, useRouter } from "next/router";

export default function RangeAddLiquidity({ isOpen, setIsOpen }) {
  const [
    rangePoolAddress,
    rangePoolData,
    rangeMintParams,
    pairSelected,
    tokenIn,
    setTokenInAllowance,
    setTokenInBalance,
    setTokenInAmount,
    tokenOut,
    setTokenOutAllowance,
    setTokenOutBalance,
    setTokenOutAmount,
    rangePositionData,
    needsAllowanceIn,
    setNeedsAllowanceIn,
    needsAllowanceOut,
    setNeedsAllowanceOut,
    needsBalanceIn,
    setNeedsBalanceIn,
    needsBalanceOut,
    setNeedsBalanceOut,
    setMintButtonState,
  ] = useRangeLimitStore((state) => [
    state.rangePoolAddress,
    state.rangePoolData,
    state.rangeMintParams,
    state.pairSelected,
    state.tokenIn,
    state.setTokenInRangeAllowance,
    state.setTokenInBalance,
    state.setTokenInAmount,
    state.tokenOut,
    state.setTokenOutRangeAllowance,
    state.setTokenOutBalance,
    state.setTokenOutAmount,
    state.rangePositionData,
    state.needsAllowanceIn,
    state.setNeedsAllowanceIn,
    state.needsAllowanceOut,
    state.setNeedsAllowanceOut,
    state.needsBalanceIn,
    state.setNeedsBalanceIn,
    state.needsBalanceOut,
    state.setNeedsBalanceOut,
    state.setMintButtonState,
  ]);

  const { bnInput, maxBalance, inputBox } = useInputBox();
  const router = useRouter();
  const provider = useProvider();
  const { address } = useAccount();
  const signer = new ethers.VoidSigner(address, provider);

  const [amount0, setAmount0] = useState(BN_ZERO);
  const [amount1, setAmount1] = useState(BN_ZERO);
  const [disabled, setDisabled] = useState(false);
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

  useEffect(() => {
    setStateChainName(chainIdsToNamesForGitTokenList[chainId]);
  }, [chainId]);

  ////////////////////////////////Allowances

  const { data: tokenInAllowance } = useContractRead({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, chainProperties["arbitrumGoerli"]["routerAddress"]],
    chainId: 421613,
    watch: needsAllowanceIn && router.isReady,
    enabled: isConnected,
    onSuccess(data) {
      //console.log("Success");
      setNeedsAllowanceIn(false);
    },
    onError(error) {
      console.log("Error", error);
    },
  });

  const { data: tokenOutAllowance } = useContractRead({
    address: tokenOut.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, chainProperties["arbitrumGoerli"]["routerAddress"]],
    chainId: 421613,
    watch: needsAllowanceOut && router.isReady,
    enabled: isConnected,
    onSuccess(data) {
      //console.log("Success");
      setNeedsAllowanceOut(false);
    },
    onError(error) {
      console.log("Error", error);
    },
  });

  useEffect(() => {
    setTokenInAllowance(tokenInAllowance);
    setTokenOutAllowance(tokenOutAllowance);
  }, [tokenInAllowance, tokenOutAllowance]);

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

  //////////////////////////////Button states -> to be removed (on store)

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

  ////////////////////////////////Amounts

  useEffect(() => {
    setAmounts();
  }, [bnInput]);

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
        const tokenOutAmount = JSBI.greaterThan(liquidity, ZERO)
          ? tokenOrder
            ? DyDxMath.getDy(liquidity, lowerSqrtPrice, rangeSqrtPrice, true)
            : DyDxMath.getDx(liquidity, rangeSqrtPrice, upperSqrtPrice, true)
          : ZERO;
        // set amount based on bnInput
        setTokenInAmount(bnInput);
        setTokenOutAmount(BigNumber.from(String(tokenOutAmount)));
        setDisabled(false);
      } else {
        setTokenInAmount(BN_ZERO);
        setTokenOutAmount(BN_ZERO);
        setDisabled(true);
      }
    } catch (error) {
      console.log(error);
    }
  }

  ////////////////////////////////Mint Gas Fee
  const [mintGasLimit, setMintGasLimit] = useState(BN_ZERO);

  useEffect(() => {
    if (
      rangeMintParams.tokenInAmount &&
      rangeMintParams.tokenInAmount != BN_ZERO &&
      rangeMintParams.tokenOutAmount &&
      rangeMintParams.tokenOutAmount != BN_ZERO &&
      rangePositionData.min &&
      rangePositionData.max &&
      Number(rangePositionData.min) < Number(rangePositionData.max)
    ) {
      updateGasFee();
    }
  }, [tokenInAllowance, tokenOutAllowance, rangeMintParams, bnInput]);

  async function updateGasFee() {
    const newGasFee = await gasEstimateRangeMint(
      rangePoolAddress,
      address,
      rangePositionData.min,
      rangePositionData.max,
      rangeMintParams.tokenInAmount,
      rangeMintParams.tokenOutAmount,
      signer,
      rangePositionData.positionId
    );
    setMintGasLimit(newGasFee.gasUnits.mul(130).div(100));
  }

  ////////////////////////////////Mint Button State

  // set amount in
  useEffect(() => {
    if (!bnInput.eq(BN_ZERO)) {
      setTokenInAmount(bnInput);
    }
  }, [bnInput]);

  useEffect(() => {
    setMintButtonState();
  }, [rangeMintParams.tokenInAmount, rangeMintParams.tokenOutAmount]);

  ////////////////////////////////

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
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-[4px] bg-black text-white border border-grey text-left align-middle shadow-xl px-5 py-5 transition-all">
                <div className="flex items-center justify-between px-2 mb-5">
                  <h1 className="">Add Liquidity</h1>
                  <XMarkIcon
                    onClick={() => setIsOpen(false)}
                    className="w-7 cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-y-3 mb-5">
                  <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2.5 flex flex-col gap-y-2">
                    <div className="flex items-end justify-between text-[11px] text-grey1">
                      <span>
                        ~$
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
                      </span>
                      <span>
                        BALANCE: {tokenIn.userBalance ? 0 : tokenIn.userBalance}
                      </span>
                    </div>
                    <div className="flex items-end justify-between mt-2 mb-3">
                      {inputBox("0")}
                      <div className="flex items-center gap-x-2">
                        {isConnected && stateChainName === "arbitrumGoerli" ? (
                          <button
                            onClick={() => maxBalance(tokenIn.userBalance, "0")}
                            className="text-xs text-grey1 bg-dark h-10 px-3 rounded-[4px] border-grey border"
                          >
                            MAX
                          </button>
                        ) : null}
                        <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] min-w-[160px]">
                          <img height="28" width="25" src={tokenIn.logoURI} />
                          {tokenIn.symbol}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border border-grey rounded-[4px] w-full py-3 px-5 mt-2 flex flex-col gap-y-2">
                    <div className="flex items-end justify-between text-[11px] text-grey1">
                      <span>
                        ~$
                        {(
                          Number(tokenOut.rangeUSDPrice) *
                          Number(
                            ethers.utils.formatUnits(
                              rangeMintParams.tokenOutAmount,
                              18
                            )
                          )
                        ).toFixed(2)}
                      </span>
                      <span>
                        BALANCE:{" "}
                        {tokenOut.userBalance ? 0 : tokenOut.userBalance}
                      </span>
                    </div>
                    <div className="flex items-end justify-between mt-2 mb-3">
                      <span className="text-3xl">
                        {Number(rangeMintParams.tokenOutAmount) != 0
                          ? Number(
                              ethers.utils.formatUnits(
                                rangeMintParams.tokenOutAmount,
                                tokenIn.decimals
                              )
                            ).toPrecision(5)
                          : 0}
                      </span>
                      <div className="flex items-center gap-x-2">
                        <div className="w-full text-xs uppercase whitespace-nowrap flex items-center gap-x-3 bg-dark border border-grey px-3 h-full rounded-[4px] h-[2.5rem] min-w-[160px]">
                          <img height="28" width="25" src={tokenOut.logoURI} />
                          {tokenOut.symbol}
                        </div>
                      </div>
                    </div>
                  </div>
                  {!tokenInAllowance || !tokenOutAllowance ? (
                    <button
                      disabled={disabled}
                      className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
                    >
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
                      {tokenInAllowance?.gte(rangeMintParams.tokenInAmount) &&
                      tokenOutAllowance?.gte(rangeMintParams.tokenOutAmount) ? (
                        <RangeAddLiqButton
                          routerAddress={
                            chainProperties["arbitrumGoerli"]["routerAddress"]
                          }
                          poolAddress={rangePoolAddress}
                          address={address}
                          lower={rangePositionData.min}
                          upper={rangePositionData.max}
                          amount0={rangeMintParams.tokenInAmount}
                          amount1={rangeMintParams.tokenOutAmount}
                          disabled={rangeMintParams.disabled}
                          setIsOpen={setIsOpen}
                          positionId={rangePositionData.positionId}
                          gasLimit={mintGasLimit}
                        />
                      ) : (tokenInAllowance.lt(rangeMintParams.tokenInAmount) &&
                          tokenOutAllowance.lt(
                            rangeMintParams.tokenOutAmount
                          )) ||
                        doubleApprove ? (
                        <RangeMintDoubleApproveButton
                          routerAddress={
                            chainProperties["arbitrumGoerli"]["routerAddress"]
                          }
                          tokenIn={tokenIn}
                          tokenOut={tokenOut}
                          amount0={rangeMintParams.tokenInAmount}
                          amount1={rangeMintParams.tokenOutAmount}
                        />
                      ) : !doubleApprove &&
                        tokenInAllowance.lt(rangeMintParams.tokenInAmount) ? (
                        <RangeMintApproveButton
                          routerAddress={
                            chainProperties["arbitrumGoerli"]["routerAddress"]
                          }
                          approveToken={tokenIn}
                          amount={rangeMintParams.tokenInAmount}
                        />
                      ) : !doubleApprove &&
                        tokenOutAllowance.lt(rangeMintParams.tokenOutAmount) ? (
                        <RangeMintApproveButton
                          routerAddress={
                            chainProperties["arbitrumGoerli"]["routerAddress"]
                          }
                          approveToken={tokenOut}
                          amount={rangeMintParams.tokenOutAmount}
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
