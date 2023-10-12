import {
  useWaitForTransaction,
  usePrepareContractWrite,
  useContractWrite,
} from "wagmi";
import { erc20ABI } from "wagmi";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState } from "react";
import {
  useTradeStore as useRangeLimitStore,
  useTradeStore,
} from "../../hooks/useTradeStore";

export default function SwapRouterApproveButton({
  routerAddress,
  approveToken,
  tokenSymbol,
  amount,
}) {
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [successDisplay, setSuccessDisplay] = useState(false);

  const [setNeedsAllowanceIn] = useTradeStore((state) => [
    state.setNeedsAllowanceIn,
  ]);

  const [setNeedsAllowanceInLimit] = useRangeLimitStore((state) => [
    state.setNeedsAllowanceIn,
  ]);

  const { config } = usePrepareContractWrite({
    address: approveToken,
    abi: erc20ABI,
    functionName: "approve",
    args: [
      routerAddress,
      amount
    ],
    chainId: 421613,
  });

  const { data, isSuccess, write } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      setSuccessDisplay(true);
      setNeedsAllowanceIn(true);
      setNeedsAllowanceInLimit(true);
    },
    onError() {
      setErrorDisplay(true);
    },
  });

  return (
    <>
      <div
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={(address) => (address ? write?.() : null)}
      >
        Approve {tokenSymbol}
      </div>
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
