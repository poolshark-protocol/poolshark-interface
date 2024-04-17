import React, { useState, useEffect } from "react";
import { BN_ZERO } from "../../utils/math/constants";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import Loader from "../Icons/Loader";
import { useConfigStore } from "../../hooks/useConfigStore";
import { chainProperties } from "../../utils/chains";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import useBurnRange from "../../hooks/contracts/write/useBurnRange";

export default function RangeRemoveLiqButton({
  poolAddress,
  address,
  positionId,
  burnPercent,
  closeModal,
  setIsOpen,
  gasLimit,
  staked,
  disabled,
}) {
  const [chainId, networkName] = useConfigStore(
    useShallow((state) => [state.chainId, state.networkName]),
  );

  const [setNeedsRefetch, setNeedsBalanceIn, setNeedsPosRefetch] =
    useRangeLimitStore(
      useShallow((state) => [
        state.setNeedsRefetch,
        state.setNeedsBalanceIn,
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
    setNeedsBalanceIn(true);
    setTimeout(() => {
      setNeedsRefetch(true);
      setNeedsPosRefetch(true);
      closeModal();
      setIsOpen(false);
    }, 2000);
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
  };

  const { write, data, isLoading } = useBurnRange({
    poolAddress,
    address,
    staked,
    positionId,
    burnPercent,
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
        disabled={disabled}
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => {
          address ? write?.() : null;
        }}
      >
        {gasLimit.lte(BN_ZERO) ? <Loader /> : "Remove liquidity"}
      </button>
    </>
  );
}
