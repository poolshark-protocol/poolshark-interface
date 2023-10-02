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
      setNeedsRefetch,
      setNeedsAllowanceIn,
      setNeedsBalanceIn,
    ] = useRangeLimitStore((state) => [
      state.setNeedsRefetch,
      state.setNeedsAllowanceIn,
      state.setNeedsBalanceIn,
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
          setNeedsRefetch(true);
          setIsOpen(false);
        }, 2000);
        setTimeout(() => {
          setNeedsAllowanceIn(true);
          setNeedsBalanceIn(true);
        }, 1000);
      },
      onError() {
        setErrorDisplay(true);
      },
    });
  
    return (
      <>
      <button
        disabled={disabled}
        className="disabled:opacity-50 text-sm md:text-base disabled:cursor-not-allowed w-full py-4 mx-auto  text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
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
  