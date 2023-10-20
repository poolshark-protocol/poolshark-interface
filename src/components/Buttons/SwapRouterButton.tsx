import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useAccount,
} from "wagmi";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState } from "react";
import { useTradeStore as useRangeLimitStore } from "../../hooks/useTradeStore";
import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";
import { useConfigStore } from "../../hooks/useConfigStore";

export default function SwapRouterButton({
  disabled,
  routerAddress,
  poolAddresses,
  swapParams,
  gasLimit,
}) {
  const [
    chainId
  ] = useConfigStore((state) => [
    state.chainId,
  ]);

  const [setNeedsAllowanceIn, setNeedsBalanceIn] = useRangeLimitStore(
    (state) => [state.setNeedsAllowanceIn, state.setNeedsBalanceIn]
  );

  const [errorDisplay, setErrorDisplay] = useState(false);
  const [successDisplay, setSuccessDisplay] = useState(false);

  const { address } = useAccount();
  const userAddress = address;

  const { config } = usePrepareContractWrite({
    address: routerAddress,
    abi: poolsharkRouterABI,
    functionName: "multiSwapSplit",
    args: [poolAddresses, swapParams],
    enabled: poolAddresses.length > 0 && swapParams.length > 0,
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
      setNeedsAllowanceIn(true);
      setNeedsBalanceIn(true);
    },
    onError() {
      setErrorDisplay(true);
    },
  });

  return (
    <>
      <button
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        disabled={disabled}
        onClick={(address) => (address ? write?.() : null)}
      >
        Swap
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
