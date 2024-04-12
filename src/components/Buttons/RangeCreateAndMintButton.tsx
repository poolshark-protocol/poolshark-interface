import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import React, { useState, useEffect } from "react";
import { BN_ZERO } from "../../utils/math/constants";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { BigNumber, ethers } from "ethers";
import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";
import PositionMintModal from "../Modals/PositionMint";
import { useConfigStore } from "../../hooks/useConfigStore";
import {
  getRangeMintButtonMsgValue,
  getRangeMintInputData,
} from "../../utils/buttons";
import { chainProperties } from "../../utils/chains";
import { deepConvertBigIntAndBigNumber } from "../../utils/misc";
import { useShallow } from "zustand/react/shallow";
import useCreateLimitPoolAndMint from "../../hooks/contracts/write/useCreateLimitPoolAndMint";

export default function RangeCreateAndMintButton({
  disabled,
  buttonMessage,
  routerAddress,
  poolTypeId,
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
  setSuccessDisplay,
  setErrorDisplay,
  setIsLoading,
  setTxHash,
}) {
  const [chainId, networkName] = useConfigStore(
    useShallow((state) => [state.chainId, state.networkName]),
  );

  const [
    tokenIn,
    tokenOut,
    rangeMintParams,
    setNeedsRefetch,
    setNeedsPosRefetch,
    setNeedsAllowanceIn,
    setNeedsAllowanceOut,
    setNeedsBalanceIn,
    setNeedsBalanceOut,
  ] = useRangeLimitStore(
    useShallow((state) => [
      state.tokenIn,
      state.tokenOut,
      state.rangeMintParams,
      state.setNeedsRefetch,
      state.setNeedsPosRefetch,
      state.setNeedsAllowanceIn,
      state.setNeedsAllowanceOut,
      state.setNeedsBalanceIn,
      state.setNeedsBalanceOut,
    ]),
  );

  useEffect(() => {}, [disabled]);

  const onSuccess = () => {
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
  };

  const onError = () => {
    setErrorDisplay(true);
    setNeedsRefetch(false);
    setNeedsPosRefetch(false);
  };

  // creates new position every time
  const positionId = 0;

  const { data, write, isLoading } = useCreateLimitPoolAndMint({
    poolConfig: deepConvertBigIntAndBigNumber({
      poolTypeId: poolTypeId,
      tokenIn: token0.address,
      tokenOut: token1.address,
      startPrice: startPrice,
      swapFee: feeTier,
    }), // pool params
    rangePositions: [
      deepConvertBigIntAndBigNumber({
        to: to,
        lower: lower,
        upper: upper,
        positionId: positionId,
        amount0: amount0,
        amount1: amount1,
        callbackData: getRangeMintInputData(
          rangeMintParams.stakeFlag,
          chainProperties[networkName]["rangeStakerAddress"],
        ),
      }),
    ], // range positions
    limitPositions: [],
    msgValue: deepConvertBigIntAndBigNumber(
      getRangeMintButtonMsgValue(
        tokenIn.native,
        tokenOut.native,
        rangeMintParams.tokenInAmount,
        rangeMintParams.tokenOutAmount,
      ),
    ),
    enabled: true,
    gasLimit,
    onSuccess,
    onError,
  });

  useEffect(() => {
    if (isLoading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    setTxHash(data?.hash);
  }, [data]);

  const ConfirmTransaction = () => {
    write?.();
    window.safary?.track({
      eventType: "range",
      eventName: "range-mint",
      parameters: {
        amount0: Number(ethers.utils.formatEther(amount0)),
        amount1: Number(ethers.utils.formatEther(amount1)),
        feeTier: feeTier as string,
        routerAddress: routerAddress as string,
        lower: lower as string,
        upper: upper as string,
        startPrice: startPrice as string,
      },
    });
  };

  return (
    <>
      <button
        disabled={disabled || gasLimit.lte(BN_ZERO)}
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={ConfirmTransaction}
      >
        {buttonMessage != undefined && buttonMessage != ""
          ? buttonMessage
          : "CREATE POOL AND MINT"}
      </button>
    </>
  );
}
