import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { coverPoolABI } from "../../abis/evm/coverPool";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState, useEffect } from "react";
import { roundTick } from "../../utils/math/tickMath";
import { BigNumber, ethers } from "ethers";
import { useCoverStore } from "../../hooks/useCoverStore";
import router from "next/router";
import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";
import PositionMintModal from "../Modals/PositionMint";
import { BN_ZERO } from "../../utils/math/constants";
import Loader from "../Icons/Loader";

export default function CoverMintButton({
  routerAddress,
  poolAddress,
  disabled,
  to,
  lower,
  upper,
  amount,
  zeroForOne,
  tickSpacing,
  buttonMessage,
  gasLimit,
  setSuccessDisplay,
  setErrorDisplay,
  setIsLoading,
  setTxHash
}) {

  const [
    setNeedsRefetch,
    setNeedsPosRefetch,
    setNeedsAllowance,
    setNeedsBalance,
  ] = useCoverStore((state) => [
    state.setNeedsRefetch,
    state.setNeedsPosRefetch,
    state.setNeedsAllowance,
    state.setNeedsBalance,
  ]);

  const newPositionId = 0;

  const { config } = usePrepareContractWrite({
    address: routerAddress,
    abi: poolsharkRouterABI,
    functionName: "multiMintCover",
    args: [
      [poolAddress],
      [
        {
          to: to,
          amount: amount,
          positionId: newPositionId,
          lower: BigNumber.from(roundTick(Number(lower), tickSpacing)),
          upper: BigNumber.from(roundTick(Number(upper), tickSpacing)),
          zeroForOne: zeroForOne,
          callbackData: ethers.utils.formatBytes32String(""),
        },
      ],
    ],
    overrides: {
      gasLimit: gasLimit,
    },
    enabled: !disabled,
    chainId: 421613,
  });

  const { data, write } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      setSuccessDisplay(true);
      setNeedsAllowance(true);
      setNeedsBalance(true);
      setNeedsRefetch(true);
      setNeedsPosRefetch(true);
  }});

  useEffect(() => {
    if(isLoading) {
      setIsLoading(true)
    } else {
      setIsLoading(false)
    }
  }, [isLoading]);
  
  useEffect(() => {
    setTxHash(data?.hash)
  }, [data]);

  return (
    <>
      <button
        disabled={gasLimit.lte(BN_ZERO) || disabled}
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => write?.()}
      >
       {gasLimit.lte(BN_ZERO) ? <Loader/> : buttonMessage}
      </button>
    </>
  );
}
