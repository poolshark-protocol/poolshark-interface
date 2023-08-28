import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { rangePoolABI } from "../../abis/evm/rangePool";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState, useEffect } from "react";
import { BN_ZERO } from "../../utils/math/constants";
import { useRangeStore } from "../../hooks/useRangeStore";

export default function RangeMintButton({
  disabled,
  buttonMessage,
  poolAddress,
  to,
  lower,
  upper,
  amount0,
  amount1,
  closeModal,
  gasLimit,
}) {
  const [
    setNeedsRefetch,
    setNeedsAllowanceIn,
    setNeedsAllowanceOut,
    setNeedsBalanceIn,
    setNeedsBalanceOut,
  ] = useRangeStore((state) => [
    state.setNeedsRefetch,
    state.setNeedsAllowanceIn,
    state.setNeedsAllowanceOut,
    state.setNeedsBalanceIn,
    state.setNeedsBalanceOut,
  ]);
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [successDisplay, setSuccessDisplay] = useState(false);

  useEffect(() => {}, [disabled]);

  const positionId = 0; /// @dev - assume new position

  const { config } = usePrepareContractWrite({
    address: poolAddress,
    abi: rangePoolABI,
    functionName: "mintRange",
    args: [[to, lower, upper, positionId, amount0, amount1]],
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
      setNeedsRefetch(true);
      setNeedsAllowanceIn(true);
      if (amount1.gt(BN_ZERO)) {
        setNeedsAllowanceOut(true);
      }
      setNeedsBalanceIn(true);
      setNeedsBalanceOut(true);
    },
    onError() {
      setErrorDisplay(true);
    },
  });

  return (
    <>
      <button
        disabled={disabled /* || gasLimit.lte(BN_ZERO) */}
        className={
          disabled
            ? "w-full py-4 mx-auto font-medium text-center text-sm md:text-base transition rounded-xl cursor-not-allowed bg-gradient-to-r from-[#344DBF] to-[#3098FF] opacity-50"
            : "w-full py-4 mx-auto font-medium text-center text-sm md:text-base transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
        }
        onClick={() => write?.()}
      >
        {buttonMessage}
      </button>
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
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
