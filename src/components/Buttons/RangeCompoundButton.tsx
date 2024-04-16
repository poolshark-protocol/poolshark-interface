import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { rangePoolABI } from "../../abis/evm/rangePool";
import React, { useState, useEffect } from "react";
import { BN_ONE, BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import { useConfigStore } from "../../hooks/useConfigStore";
import { rangeStakerABI } from "../../abis/evm/rangeStaker";
import { chainProperties } from "../../utils/chains";
import { getRangeStakerAddress } from "../../utils/config";
import { toast } from "sonner";
import { deepConvertBigIntAndBigNumber } from "../../utils/misc";
import { useShallow } from "zustand/react/shallow";
import useBurnRange from "../../hooks/contracts/write/useBurnRange";

export default function RangeCompoundButton({
  poolAddress,
  address,
  positionId,
  staked,
}) {
  const [toastId, setToastId] = useState(null);

  const [chainId, networkName] = useConfigStore(
    useShallow((state) => [state.chainId, state.networkName]),
  );

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
    burnPercent: BN_ZERO,
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
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => {
          address ? write?.() : null;
        }}
        disabled={false}
      >
        Compound position
      </button>
    </>
  );
}
