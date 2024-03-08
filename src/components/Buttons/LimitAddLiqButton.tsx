import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
  } from "wagmi";
import React, { useState, useEffect } from "react";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";
import { ethers } from "ethers";
import { useConfigStore } from "../../hooks/useConfigStore";
import { toast } from "sonner";
import { chainProperties } from "../../utils/chains";
import { deepConvertBigIntAndBigNumber } from "../../utils/misc";
  
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
    const [chainId, networkName] = useConfigStore((state) => [
      state.chainId,
      state.networkName,
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
    const [toastId, setToastId] = useState(null);
  
    useEffect(() => {}, [disabled]);
  
    const { config } = usePrepareContractWrite({
      address: routerAddress,
      abi: poolsharkRouterABI,
      functionName: "multiMintLimit",
      args: [
        [poolAddress],
        [deepConvertBigIntAndBigNumber({
          to: to,
          amount: amount,
          mintPercent: mintPercent,
          positionId: positionId,
          lower: lower,
          upper: upper,
          zeroForOne: zeroForOne,
          callbackData: ethers.utils.formatBytes32String('')
        })]
      ],
      chainId: chainId,
      enabled: positionId != undefined,
      gasLimit: deepConvertBigIntAndBigNumber(gasLimit),
    });
  
    const { data, write } = useContractWrite(config);
  
    const { isLoading } = useWaitForTransaction({
      hash: data?.hash,
      onSuccess() {
        toast.success("Your transaction was successful",{
          id: toastId,
          action: {
            label: "View",
            onClick: () => window.open(`${chainProperties[networkName]["explorerUrl"]}/tx/${data?.hash}`, '_blank'),
          },
        });
        setNeedsSnapshot(true);
        setNeedsAllowanceIn(true);
        setNeedsBalanceIn(true);
        setTimeout(() => {
          setNeedsRefetch(true);
          setIsOpen(false);
        }, 2000);
      },
      onError() {
        toast.error("Your transaction failed",{
          id: toastId,
          action: {
            label: "View",
            onClick: () => window.open(`${chainProperties[networkName]["explorerUrl"]}/tx/${data?.hash}`, '_blank'),
          },
        });
      },
    });

    useEffect(() => {
      if(isLoading) {
        const newToastId = toast.loading("Your transaction is being confirmed...",{
          action: {
            label: "View",
            onClick: () => window.open(`${chainProperties[networkName]["explorerUrl"]}/tx/${data?.hash}`, '_blank'),
          },
        });
        newToastId
        setToastId(newToastId);
      }
    }, [isLoading]);
  
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
              <>Low {tokenSymbol} Balance</>
            ) : (
              <></>
            )}
          </>
        ) : (
          <> Add Liquidity</>
        )}
      </button>
      </>
    );
  }
  