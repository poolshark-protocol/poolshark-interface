import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { limitPoolABI } from "../../abis/evm/limitPool";
import React, { useState, useEffect } from "react";
import { BigNumber } from "ethers";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import Loader from "../Icons/Loader";
import { useConfigStore } from "../../hooks/useConfigStore";
import { BN_ZERO } from "../../utils/math/constants";
import { toast } from "sonner";
import { chainProperties } from "../../utils/chains";

export default function LimitCollectButton({
  poolAddress,
  address,
  positionId,
  claim,
  zeroForOne,
  gasLimit,
  gasFee,
  disabled,
}) {
  const [toastId, setToastId] = useState(null);

  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

  const [
    setNeedsBalanceIn,
    setNeedsSnapshot,
    setNeedsRefetch,
    setNeedsPosRefetch,
  ] = useRangeLimitStore((state) => [
    state.setNeedsBalanceIn,
    state.setNeedsSnapshot,
    state.setNeedsRefetch,
    state.setNeedsPosRefetch,
  ]);

  const { config } = usePrepareContractWrite({
    address: poolAddress,
    abi: limitPoolABI,
    functionName: "burnLimit",
    args: [
      {
        to: address,
        burnPercent: BN_ZERO,
        positionId: positionId,
        claim: claim,
        zeroForOne: zeroForOne
      },
    ],
    chainId: chainId,
    enabled: positionId != undefined,
    overrides: {
      gasLimit: gasLimit,
    },
  });

  const { data, isSuccess, write } = useContractWrite(config);

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
      setNeedsBalanceIn(true);
      setNeedsSnapshot(true);
      setTimeout(() => {
        setNeedsRefetch(true);
        setNeedsPosRefetch(true);
      }, 10000);
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
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        disabled={gasLimit.lte(BN_ZERO) || disabled}
        onClick={() => {
          address ? write?.() : null;
        }}
      >
        {gasLimit.lte(BN_ZERO) && !disabled ? <Loader /> : disabled ? "Nothing to collect" : "Collect position"}
      </button>
    </>
  );
}
