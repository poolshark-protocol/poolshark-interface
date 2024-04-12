import React, { useState, useEffect } from "react";
import { BN_ONE } from "../../utils/math/constants";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { useConfigStore } from "../../hooks/useConfigStore";
import { chainProperties } from "../../utils/chains";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import useBurnRange from "../../hooks/contracts/write/useBurnRange";

export default function RangeCollectButton({
  poolAddress,
  address,
  positionId,
  staked,
}) {
  const [toastId, setToastId] = useState(null);

  const [chainId, networkName] = useConfigStore(
    useShallow((state) => [state.chainId, state.networkName]),
  );

  const [setNeedsBalanceIn, setNeedsBalanceOut] = useRangeLimitStore(
    useShallow((state) => [state.setNeedsBalanceIn, state.setNeedsBalanceOut]),
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
    setNeedsBalanceIn(true);
    setNeedsBalanceOut(true);
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
    burnPercent: BN_ONE,
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
      <div
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-grey2 bg-grey3/30 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => {
          address ? write?.() : null;
        }}
      >
        Collect position
      </div>
    </>
  );
}
