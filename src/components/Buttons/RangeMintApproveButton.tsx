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
import { useTradeStore as useRangeLimitStore } from "../../hooks/useTradeStore";
import { useConfigStore } from "../../hooks/useConfigStore";

export default function RangeMintApproveButton({
  routerAddress,
  approveToken,
  amount,
}) {
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [successDisplay, setSuccessDisplay] = useState(false);

  const [
    chainId,
    networkName
  ] = useConfigStore((state) => [
    state.chainId,
    state.networkName
  ]);

  const [setNeedsAllowanceIn] = useRangeLimitStore((state) => [
    state.setNeedsAllowanceIn,
  ]);

  const { config: t0 } = usePrepareContractWrite({
    address: approveToken.address,
    abi: erc20ABI,
    functionName: "approve",
    args: [
      routerAddress,
      amount
    ],
    chainId: chainId,
  });

  const {
    data: dataT0,
    isSuccess: isSuccesT0,
    write: writeT0,
  } = useContractWrite(t0);

  const { isLoading: isLoadingT0 } = useWaitForTransaction({
    hash: dataT0?.hash,
    onSuccess() {
      setSuccessDisplay(true);
      setNeedsAllowanceIn(true);
    },
    onError() {
      setErrorDisplay(true);
    },
  });

  return (
    <>
      <div
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => writeT0?.()}
      >
        Approve {approveToken.symbol}
      </div>
      <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-50">
        <ErrorToast
          key={dataT0?.hash + "error"}
          hash={dataT0?.hash}
          errorDisplay={errorDisplay}
          setErrorDisplay={setErrorDisplay}
        />
        {isLoadingT0 ? <ConfirmingToast hash={dataT0?.hash} /> : <></>}
        <SuccessToast
          key={dataT0?.hash + "success"}
          hash={dataT0?.hash}
          successDisplay={successDisplay}
          setSuccessDisplay={setSuccessDisplay}
        />
      </div>
    </>
  );
}
