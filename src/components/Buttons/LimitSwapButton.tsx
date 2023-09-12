import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState, useEffect } from "react";
import { limitPoolABI } from "../../abis/evm/limitPool";
import { useTradeStore } from "../../hooks/useTradeStore";
import { BN_ZERO } from "../../utils/math/constants";

export default function LimitSwapButton({
  disabled,
  poolAddress,
  to,
  amount,
  mintPercent,
  lower,
  upper,
  zeroForOne,
  closeModal,
  gasLimit,
}) {
  const [setNeedsAllowanceIn, setNeedsBalanceIn] = useTradeStore((state) => [
    state.setNeedsAllowanceIn,
    state.setNeedsBalanceIn,
  ]);
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [successDisplay, setSuccessDisplay] = useState(false);

  useEffect(() => {}, [disabled]);

  const { config } = usePrepareContractWrite({
    address: poolAddress,
    abi: limitPoolABI,
    functionName: "mintLimit",
    args: [[to, amount, mintPercent, BN_ZERO, lower, upper, zeroForOne]],
    chainId: 421613,
    overrides: {
      gasLimit: gasLimit,
    },
    onSuccess() {},
    onError() {
      setErrorDisplay(true);
    },
  });

  const { data, write } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      setSuccessDisplay(true);
      setTimeout(() => {
        closeModal();
      }, 2000);
      setNeedsAllowanceIn(true);
      // if (amount1.gt(BN_ZERO)) {
      //   setNeedsAllowanceOut(true);
      // }
      setNeedsBalanceIn(true);
    },
    onError() {
      setErrorDisplay(true);
    },
  });

  return (
    <>
      <button
        disabled={disabled /* || gasLimit.lte(BN_ZERO) */}
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => write?.()}
      >
        Mint Position
      </button>
      <div className="fixed bottom-4 right-4 flex flex-col space-y-2">
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
