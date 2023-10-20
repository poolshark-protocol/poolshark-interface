import { ethers } from "ethers";
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useSigner,
} from "wagmi";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useEffect, useState } from "react";
import { rangePoolABI } from "../../abis/evm/rangePool";
import { gasEstimateRangeBurn } from "../../utils/gas";
import { BN_ZERO } from "../../utils/math/constants";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import Loader from "../Icons/Loader";
import { useConfigStore } from "../../hooks/useConfigStore";

export default function RangeRemoveLiqButton({
  poolAddress,
  address,
  positionId,
  burnPercent,
  closeModal,
  setIsOpen,
  gasLimit,
  disabled,
}) {
  const [
    chainId
  ] = useConfigStore((state) => [
    state.chainId,
  ]);

  const [
    setNeedsRefetch,
    setNeedsBalanceIn,
    setNeedsBalanceOut,
    setNeedsPosRefetch,
  ] = useRangeLimitStore((state) => [
    state.setNeedsRefetch,
    state.setNeedsBalanceIn,
    state.setNeedsBalanceOut,
    state.setNeedsPosRefetch,
  ]);

  const [errorDisplay, setErrorDisplay] = useState(false);
  const [successDisplay, setSuccessDisplay] = useState(false);

  const { config } = usePrepareContractWrite({
    address: poolAddress,
    abi: rangePoolABI,
    functionName: "burnRange",
    args: [{ to: address, positionId: positionId, burnPercent: burnPercent }],
    chainId: chainId,
    overrides: {
      gasLimit: gasLimit,
    },
  });

  const { data, write } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      setSuccessDisplay(true);
      setNeedsBalanceIn(true);
      setTimeout(() => {
        setNeedsRefetch(true);
        setNeedsPosRefetch(true);
        closeModal();
        setIsOpen(false);
      }, 2000);
    },
    onError() {
      setErrorDisplay(true);
    },
  });

  return (
    <>
      <button
        disabled={gasLimit.lte(BN_ZERO)}
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => {
          address ? write?.() : null;
        }}
      >
        {gasLimit.lte(BN_ZERO) ? <Loader/> : "Remove liquidity"}
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
