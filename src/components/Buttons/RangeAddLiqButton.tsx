import { useWaitForTransaction } from "wagmi";
import React, { useState, useEffect } from "react";
import { BN_ZERO } from "../../utils/math/constants";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { BigNumber } from "ethers";
import Loader from "../Icons/Loader";
import { useConfigStore } from "../../hooks/useConfigStore";
import { chainProperties } from "../../utils/chains";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import useMultiMintRange from "../../hooks/contracts/write/useMultiMintRange";

export default function RangeAddLiqButton({
  routerAddress,
  poolAddress,
  address,
  lower,
  upper,
  positionId,
  amount0,
  amount1,
  disabled,
  setIsOpen,
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
    rangePositionData,
    rangeMintParams,
    setNeedsAllowanceIn,
    setNeedsAllowanceOut,
    setNeedsBalanceIn,
    setNeedsBalanceOut,
    setNeedsRefetch,
    setNeedsPosRefetch,
  ] = useRangeLimitStore(
    useShallow((state) => [
      state.rangePositionData,
      state.rangeMintParams,
      state.setNeedsAllowanceIn,
      state.setNeedsAllowanceOut,
      state.setNeedsBalanceIn,
      state.setNeedsBalanceOut,
      state.setNeedsRefetch,
      state.setNeedsPosRefetch,
    ]),
  );
  const [toastId, setToastId] = useState(null);

  const onSuccess = () => {
    toast.success("Your transaction was successful", {
      id: toastId,
      action: {
        label: "View",
        onClick: () =>
          window.open(
            `${chainProperties[networkName]["explorerUrl"]}/tx/${data?.hash}`,
            "_blank",
          ),
      },
    });
    setNeedsAllowanceIn(true);
    setNeedsBalanceIn(true);
    setTimeout(() => {
      setNeedsRefetch(true);
      setNeedsPosRefetch(true);
      setIsOpen(false);
    }, 2500);
    if (amount1.gt(BigNumber.from(0))) {
      setNeedsAllowanceOut(true);
      setNeedsBalanceOut(true);
    }
  };

  const onError = () => {
    toast.error("Your transaction failed", {
      id: toastId,
      action: {
        label: "View",
        onClick: () =>
          window.open(
            `${chainProperties[networkName]["explorerUrl"]}/tx/${data?.hash}`,
            "_blank",
          ),
      },
    });
    setNeedsRefetch(false);
    setNeedsPosRefetch(false);
  };

  //* hook wrapper
  const { config, data, write, isLoading } = useMultiMintRange({
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

  useEffect(() => {
    if (isLoading) {
      const newToastId = toast.loading(
        "Your transaction is being confirmed...",
        {
          action: {
            label: "View",
            onClick: () =>
              window.open(
                `${chainProperties[networkName]["explorerUrl"]}/tx/${data?.hash}`,
                "_blank",
              ),
          },
        },
      );
      newToastId;
      setToastId(newToastId);
    }
  }, [isLoading]);

  return (
    <>
      <button
        disabled={gasLimit.lte(BN_ZERO) || disabled}
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition flex items-center justify-center rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => {
          address ? write?.() : null;
        }}
      >
        {gasLimit?.lte(BN_ZERO) && !rangeMintParams.disabled ? (
          <Loader />
        ) : rangeMintParams.buttonMessage != "Mint Range Position" ? (
          rangeMintParams.buttonMessage
        ) : (
          "Add liquidity"
        )}
      </button>
    </>
  );
}
