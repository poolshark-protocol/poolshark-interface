import React, { useEffect, useState } from "react";
import { useConfigStore } from "../../hooks/useConfigStore";
import { chainProperties } from "../../utils/chains";
import { BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { gasEstimateRangeUnstake } from "../../utils/gas";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import useRangeUnstake from "../../hooks/contracts/write/useRangeUnstake";

export default function RangeUnstakeButton({
  address,
  rangePoolAddress,
  positionId,
  signer,
}) {
  const [chainId, networkName, limitSubgraph] = useConfigStore(
    useShallow((state) => [
      state.chainId,
      state.networkName,
      state.limitSubgraph,
    ]),
  );

  const [
    setNeedsAllowanceIn,
    setNeedsBalanceIn,
    setNeedsBalanceOut,
    setNeedsRefetch,
    setNeedsPosRefetch,
  ] = useRangeLimitStore(
    useShallow((state) => [
      state.setNeedsAllowanceIn,
      state.setNeedsBalanceIn,
      state.setNeedsBalanceOut,
      state.setNeedsRefetch,
      state.setNeedsPosRefetch,
    ]),
  );

  const [toastId, setToastId] = useState(null);
  const [unstakeGasLimit, setUnstakeGasLimit] = useState(BN_ZERO);

  useEffect(() => {
    if (positionId != undefined && rangePoolAddress != ZERO_ADDRESS) {
      updateGasFee();
    }
  }, [positionId, rangePoolAddress, signer]);

  async function updateGasFee() {
    const newGasFee = await gasEstimateRangeUnstake(
      rangePoolAddress,
      address,
      positionId,
      networkName,
      signer,
      limitSubgraph,
    );
    setUnstakeGasLimit(newGasFee.gasUnits.mul(130).div(100));
  }

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
    }, 2500);
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

  const { data, write, isLoading } = useRangeUnstake({
    rangePoolAddress,
    address,
    unstakeGasLimit,
    positionId,
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
        disabled={unstakeGasLimit?.lte(BN_ZERO)}
        className="bg-red-800/20 whitespace-nowrap border w-full border-red-500/50 text-red-500 transition-all py-1.5 px-5 text-sm uppercase cursor-pointer text-[13px]"
        onClick={() => write?.()}
      >
        Unstake Position
      </button>
    </>
  );
}
