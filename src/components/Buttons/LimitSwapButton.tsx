import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import React, { useState, useEffect } from "react";
import { useTradeStore } from "../../hooks/useTradeStore";
import { BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";
import { ethers } from "ethers";
import { useConfigStore } from "../../hooks/useConfigStore";
import { getLimitSwapButtonMsgValue } from "../../utils/buttons";
import { toast } from "sonner";
import { chainProperties } from "../../utils/chains";

export default function LimitSwapButton({
  disabled,
  routerAddress,
  poolAddress,
  to,
  amount,
  mintPercent,
  lower,
  upper,
  zeroForOne,
  closeModal,
  gasLimit,
  resetAfterSwap,
}) {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const [
    setNeedsRefetch,
    setNeedsAllowanceIn,
    setNeedsBalanceIn,
    setNeedsBalanceOut,
    setNeedsSnapshot,
    setNeedsPosRefetch,
    tokenIn,
    tokenOut,
  ] = useTradeStore((state) => [
    state.setNeedsRefetch,
    state.setNeedsAllowanceIn,
    state.setNeedsBalanceIn,
    state.setNeedsBalanceOut,
    state.setNeedsSnapshot,
    state.setNeedsPosRefetch,
    state.tokenIn,
    state.tokenOut,
  ]);
  const [toastId, setToastId] = useState(null);

  useEffect(() => {}, [disabled]);

  const { config } = usePrepareContractWrite({
    address: routerAddress,
    abi: poolsharkRouterABI,
    functionName: "multiMintLimit",
    args: [
      [poolAddress],
      [
        {
          to: to,
          amount: amount,
          mintPercent: mintPercent,
          positionId: BN_ZERO,
          lower: lower,
          upper: upper,
          zeroForOne: zeroForOne,
          callbackData: ethers.utils.formatBytes32String(""),
        },
      ],
    ],
    chainId: chainId,
    enabled: poolAddress != undefined && poolAddress != ZERO_ADDRESS,
    overrides: {
      gasLimit: gasLimit,
      value: getLimitSwapButtonMsgValue(
        tokenIn.native,
        amount
      )
    },
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
      resetAfterSwap();
      setNeedsAllowanceIn(true);
      setNeedsBalanceIn(true);
      setNeedsBalanceOut(true);
      setTimeout(() => {
        setNeedsSnapshot(true);
        setNeedsRefetch(true);
        setNeedsPosRefetch(true);
      }, 2500);
      closeModal();
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
        LIMIT SWAP
      </button>
    </>
  );
}
