import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState, useEffect } from "react";
import { BN_ZERO } from "../../utils/math/constants";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { ethers } from "ethers";
import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";
import PositionMintModal from "../Modals/PositionMint";
  

export default function RangeCreateAndMintButton({
  disabled,
  buttonMessage,
  routerAddress,
  poolType,
  token0,
  token1,
  startPrice,
  feeTier,
  to,
  lower,
  upper,
  amount0,
  amount1,
  closeModal,
  gasLimit,
}) {
  const [
    setNeedsRefetch,
    setNeedsPosRefetch,
    setNeedsAllowanceIn,
    setNeedsAllowanceOut,
    setNeedsBalanceIn,
    setNeedsBalanceOut,
  ] = useRangeLimitStore((state) => [
    state.setNeedsRefetch,
    state.setNeedsPosRefetch,
    state.setNeedsAllowanceIn,
    state.setNeedsAllowanceOut,
    state.setNeedsBalanceIn,
    state.setNeedsBalanceOut,
  ]);
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [successDisplay, setSuccessDisplay] = useState(false);

  useEffect(() => {}, [disabled]);

  // creates new position every time
  const positionId = 0;

  const { config } = usePrepareContractWrite({
    address: routerAddress,
    abi: poolsharkRouterABI,
    functionName: "createLimitPoolAndMint",
    args: [
      {
        poolType: ethers.utils.formatBytes32String(poolType),
        tokenIn: token0.address,
        tokenOut: token1.address,
        startPrice: startPrice,
        swapFee: feeTier,
      }, // pool params
      [
        {
          to: to,
          lower: lower,
          upper: upper,
          positionId: positionId,
          amount0: amount0,
          amount1: amount1,
          callbackData: ethers.utils.formatBytes32String(""),
        },
      ], // range positions
      [], // limit positions
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
      setNeedsAllowanceIn(true);
      if (amount1.gt(BN_ZERO)) {
        setNeedsAllowanceOut(true);
      }
      setNeedsBalanceIn(true);
      setNeedsBalanceOut(true);
      setTimeout(() => {
        setNeedsRefetch(true);
        setNeedsPosRefetch(true);
        closeModal();
      }, 2000);
    },

    onError() {
      setErrorDisplay(true);
      setNeedsRefetch(false);
      setNeedsPosRefetch(false);
    },
  });

  return (
    <>
      <button
        disabled={disabled /* || gasLimit.lte(BN_ZERO) */}
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => write?.()}
      >
        {buttonMessage}
      </button>
      <PositionMintModal errorDisplay={errorDisplay} hash={data?.hash} isLoading={isLoading} successDisplay={successDisplay} type={"range"}/>
    </>
  );
}
