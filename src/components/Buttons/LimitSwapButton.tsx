import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState, useEffect } from "react";
import { useTradeStore } from "../../hooks/useTradeStore";
import { BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";
import { ethers } from "ethers";
import { useConfigStore } from "../../hooks/useConfigStore";
import { getLimitSwapButtonMsgValue } from "../../utils/buttons";

export default function LimitSwapButton({
  disabled,
  routerAddress,
  poolAddress,
  to,
  amount,
  mintPercent,
  lower,
  upper,
  zeroForOne,
  closeModal,
  gasLimit,
  resetAfterSwap,
}) {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const [
    setNeedsRefetch,
    setNeedsAllowanceIn,
    setNeedsBalanceIn,
    setNeedsSnapshot,
    setNeedsPosRefetch,
    tokenIn,
    tokenOut,
  ] = useTradeStore((state) => [
    state.setNeedsRefetch,
    state.setNeedsAllowanceIn,
    state.setNeedsBalanceIn,
    state.setNeedsSnapshot,
    state.setNeedsPosRefetch,
    state.tokenIn,
    state.tokenOut,
  ]);
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [successDisplay, setSuccessDisplay] = useState(false);

  useEffect(() => {}, [disabled]);

  const { config } = usePrepareContractWrite({
    address: routerAddress,
    abi: poolsharkRouterABI,
    functionName: "multiMintLimit",
    args: [
      [poolAddress],
      [
        {
          to: to,
          amount: amount,
          mintPercent: mintPercent,
          positionId: BN_ZERO,
          lower: lower,
          upper: upper,
          zeroForOne: zeroForOne,
          callbackData: ethers.utils.formatBytes32String(""),
        },
      ],
    ],
    chainId: chainId,
    enabled: poolAddress != undefined && poolAddress != ZERO_ADDRESS,
    overrides: {
      gasLimit: gasLimit,
      value: getLimitSwapButtonMsgValue(
        tokenIn.native,
        amount
      )
    },
    onError() {
      setErrorDisplay(true);
    },
  });

  const { data, write } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      setSuccessDisplay(true);
      resetAfterSwap();
      setNeedsAllowanceIn(true);
      setNeedsBalanceIn(true);
      setNeedsSnapshot(true);
      setTimeout(() => {
        setNeedsRefetch(true);
        setNeedsPosRefetch(true);
      }, 2500);
      closeModal();
    },
    onError() {
      setErrorDisplay(true);
    },
  });

  return (
    <>
      <button
        disabled={disabled}
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => write?.()}
      >
        LIMIT SWAP
      </button>
      <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-50">
        {errorDisplay && (
          <ErrorToast
            hash={data?.hash}
            errorDisplay={errorDisplay}
            setErrorDisplay={setErrorDisplay}
          />
        )}
        {isLoading ? <ConfirmingToast hash={data?.hash} /> : <></>}
        {successDisplay && (
          <SuccessToast
            hash={data?.hash}
            successDisplay={successDisplay}
            setSuccessDisplay={setSuccessDisplay}
          />
        )}
      </div>
    </>
  );
}
