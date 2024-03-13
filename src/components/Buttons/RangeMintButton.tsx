import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import React, { useState, useEffect } from "react";
import { BN_ZERO } from "../../utils/math/constants";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";
import { ethers } from "ethers";
import PositionMintModal from "../Modals/PositionMint";
import Loader from "../Icons/Loader";
import { useConfigStore } from "../../hooks/useConfigStore";
import {
  getRangeMintButtonMsgValue,
  getRangeMintInputData,
} from "../../utils/buttons";
import { chainProperties } from "../../utils/chains";
import { getRangeStakerAddress } from "../../utils/config";
import { deepConvertBigIntAndBigNumber } from "../../utils/misc";

export default function RangeMintButton({
  disabled,
  buttonMessage,
  routerAddress,
  poolAddress,
  to,
  lower,
  upper,
  amount0,
  amount1,
  gasLimit,
  setSuccessDisplay,
  setErrorDisplay,
  setIsLoading,
  setTxHash,
}) {
  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

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
  ] = useRangeLimitStore((state) => [
    state.tokenIn,
    state.tokenOut,
    state.rangeMintParams,
    state.setNeedsRefetch,
    state.setNeedsPosRefetch,
    state.setNeedsAllowanceIn,
    state.setNeedsAllowanceOut,
    state.setNeedsBalanceIn,
    state.setNeedsBalanceOut,
  ]);

  useEffect(() => {}, [disabled]);

  const positionId = 0; /// @dev - assume new position

  const { config } = usePrepareContractWrite({
    address: routerAddress,
    abi: poolsharkRouterABI,
    functionName: "multiMintRange",
    args: [
      [poolAddress],
      [
        deepConvertBigIntAndBigNumber({
          to: to,
          lower: lower,
          upper: upper,
          positionId: positionId,
          amount0: amount0,
          amount1: amount1,
          callbackData: getRangeMintInputData(
            rangeMintParams.stakeFlag,
            getRangeStakerAddress(networkName),
          ),
        }),
      ],
    ],
    chainId: chainId,
    gasLimit: deepConvertBigIntAndBigNumber(gasLimit),
    value: deepConvertBigIntAndBigNumber(
      getRangeMintButtonMsgValue(
        tokenIn.native,
        tokenOut.native,
        rangeMintParams.tokenInAmount,
        rangeMintParams.tokenOutAmount,
      ),
    ),
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
      setNeedsBalanceIn(true);
      setNeedsBalanceOut(true);
      setNeedsAllowanceIn(true);
      setNeedsRefetch(true);
      setNeedsPosRefetch(true);
      if (amount1.gt(BN_ZERO)) {
        setNeedsAllowanceOut(true);
      }
    },
    onError() {
      setErrorDisplay(true);
      setNeedsRefetch(false);
      setNeedsPosRefetch(false);
    },
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
        poolAddress: poolAddress as string,
        routerAddress: routerAddress as string,
        lower: lower as string,
        upper: upper as string,
      },
    });
  };

  return (
    <>
      <button
        disabled={disabled || gasLimit.lte(BN_ZERO)}
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center flex items-center justify-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={ConfirmTransaction}
      >
        {gasLimit.lte(BN_ZERO) && !disabled ? <Loader /> : buttonMessage}
      </button>
    </>
  );
}
