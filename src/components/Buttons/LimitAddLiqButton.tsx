import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
  } from "wagmi";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState, useEffect } from "react";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";
import { ethers } from "ethers";
import { useConfigStore } from "../../hooks/useConfigStore";
  
  export default function LimitAddLiqButton({
    disabled,
    routerAddress,
    poolAddress,
    to,
    amount,
    mintPercent,
    lower,
    upper,
    positionId,
    zeroForOne,
    gasLimit,
    setIsOpen,
    buttonState,
    tokenSymbol,
  }) {
    const [
      chainId
    ] = useConfigStore((state) => [
      state.chainId,
    ]);

    const [
      setNeedsRefetch,
      setNeedsAllowanceIn,
      setNeedsBalanceIn,
      setNeedsSnapshot,
    ] = useRangeLimitStore((state) => [
      state.setNeedsRefetch,
      state.setNeedsAllowanceIn,
      state.setNeedsBalanceIn,
      state.setNeedsSnapshot,
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
        [{
          to: to,
          amount: amount,
          mintPercent: mintPercent,
          positionId: positionId,
          lower: lower,
          upper: upper,
          zeroForOne: zeroForOne,
          callbackData: ethers.utils.formatBytes32String('')
        }]
      ],
      chainId: chainId,
      enabled: positionId != undefined,
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
        setNeedsSnapshot(true);
        setNeedsAllowanceIn(true);
        setNeedsBalanceIn(true);
        setTimeout(() => {
          setNeedsRefetch(true);
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
        disabled={disabled}
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => write?.()}
      >
        {disabled ? (
          <>
            {buttonState === "amount" ? <>Input Amount</> : <></>}
            {buttonState === "balance" ? (
              <>Insufficient {tokenSymbol} Balance</>
            ) : (
              <></>
            )}
          </>
        ) : (
          <> Add Liquidity</>
        )}
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
  