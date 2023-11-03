import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState } from "react";
import { roundTick } from "../../utils/math/tickMath";
import { BigNumber, ethers } from "ethers";
import { useCoverStore } from "../../hooks/useCoverStore";
import router from "next/router";
import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";
import PositionMintModal from "../Modals/PositionMint";
import { BN_ZERO } from "../../utils/math/constants";
import Loader from "../Icons/Loader";
import { useEffect } from "react";
import { useConfigStore } from "../../hooks/useConfigStore";

export default function CoverCreateAndMintButton({
  routerAddress,
  poolType,
  tokenIn,
  tokenOut,
  volTier,
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
    chainId,
    networkName
  ] = useConfigStore((state) => [
    state.chainId,
    state.networkName
  ]);

  console.log('cover create and mint button', disabled)

  const [setNeedsRefetch, setNeedsAllowance, setNeedsBalance, twapReady] = useCoverStore(
    (state) => [
      state.setNeedsRefetch,
      state.setNeedsAllowance,
      state.setNeedsBalance,
      state.twapReady
    ]
  );

  const newPositionId = 0;

  const { config } = usePrepareContractWrite({
    address: routerAddress,
    abi: poolsharkRouterABI,
    functionName: "createCoverPoolAndMint",
    args: [
      {
        poolType: poolType,
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        feeTier: volTier.feeAmount,
        tickSpread: volTier.tickSpread,
        twapLength: volTier.twapLength,
      }, // pool params
      twapReady ? [
        {
          to: to,
          amount: amount,
          positionId: newPositionId,
          lower: BigNumber.from(roundTick(Number(lower), tickSpacing)),
          upper: BigNumber.from(roundTick(Number(upper), tickSpacing)),
          zeroForOne: zeroForOne,
          callbackData: ethers.utils.formatBytes32String(""),
        },
      ] : [], // cover positions
    ],
    overrides: {
      gasLimit: gasLimit,
    },
    enabled: !disabled,
    chainId: chainId,
  });

  const { data, write } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      setSuccessDisplay(true);
      setNeedsRefetch(true);
      setNeedsAllowance(true);
      setNeedsBalance(true);
      router.push("/cover");
    },
    onError() {
      setErrorDisplay(true);
    },
  });

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
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full flex items-center justify-center border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => write?.()}
      >
        {gasLimit.lte(BN_ZERO) && !disabled ? <Loader/> : buttonMessage}
      </button>
    </>
  );
}
