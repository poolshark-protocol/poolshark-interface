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
import { useConfigStore } from "../../hooks/useConfigStore";
import { weth9ABI } from "../../abis/evm/weth9";
import { BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
  
  export default function SwapWrapEtherButton({
    disabled,
    routerAddress,
    wethAddress,
    tokenInSymbol,
    amountIn,
    gasLimit,
    resetAfterSwap
  }) {
    const [
      chainId,
      networkName
    ] = useConfigStore((state) => [
      state.chainId,
      state.networkName
    ]);
  
    const [setNeedsAllowanceIn, setNeedsBalanceIn, setNeedsBalanceOut, tradeButton] = useRangeLimitStore(
      (state) => [state.setNeedsAllowanceIn, state.setNeedsBalanceIn, state.setNeedsBalanceOut, state.tradeButton]
    );
  
    const [errorDisplay, setErrorDisplay] = useState(false);
    const [successDisplay, setSuccessDisplay] = useState(false);
  
    const { address } = useAccount();
    const userAddress = address;
  
    const { config } = usePrepareContractWrite({
      address: wethAddress,
      abi: weth9ABI,
      functionName: "deposit",
      args: [],
      enabled: routerAddress != undefined && wethAddress != ZERO_ADDRESS,
      chainId: chainId,
      overrides: {
        gasLimit: gasLimit,
        value: amountIn,
      },
    });
  
    const { data, write } = useContractWrite(config);
  
    const { isLoading } = useWaitForTransaction({
      hash: data?.hash,
      onSuccess() {
        setSuccessDisplay(true);
        resetAfterSwap()
        setNeedsAllowanceIn(true);
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
          className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
          disabled={disabled || gasLimit.lte(BN_ZERO)}
          onClick={(address) => (address ? write?.() : null)}
        >
          { disabled && tradeButton.buttonMessage != '' ? tradeButton.buttonMessage : 'Wrap ' + tokenInSymbol }
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
  