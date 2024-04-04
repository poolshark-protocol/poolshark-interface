import React, { useEffect } from "react";
import { BN_ZERO } from "../../utils/math/constants";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { ethers } from "ethers";
import Loader from "../Icons/Loader";
import { useConfigStore } from "../../hooks/useConfigStore";
import useMultiMintRange from "../../hooks/contracts/write/useMultiMintRange";
import { useShallow } from "zustand/react/shallow";

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

  const positionId = 0; /// @dev - assume new position

  const onSuccess = () => {
    setSuccessDisplay(true);
    setNeedsBalanceIn(true);
    setNeedsBalanceOut(true);
    setNeedsAllowanceIn(true);
    setNeedsRefetch(true);
    setNeedsPosRefetch(true);
    if (amount1.gt(BN_ZERO)) {
      setNeedsAllowanceOut(true);
    }
  };

  const onError = () => {
    setErrorDisplay(true);
    setNeedsRefetch(false);
    setNeedsPosRefetch(false);
  };

  const { write } = useMultiMintRange({
    positionId,
    lower,
    upper,
    disabled,
    amount0,
    amount1,
    gasLimit,
    setIsLoading,
    setTxHash,
    onSuccess,
    onError,
  });

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
