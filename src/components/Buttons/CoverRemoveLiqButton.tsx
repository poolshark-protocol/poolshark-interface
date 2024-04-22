import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { coverPoolABI } from "../../abis/evm/coverPool";
import React, { useState, useEffect } from "react";
import { useCoverStore } from "../../hooks/useCoverStore";
import { BN_ZERO } from "../../utils/math/constants";
import Loader from "../Icons/Loader";
import { useConfigStore } from "../../hooks/useConfigStore";
import { toast } from "sonner";
import { chainProperties } from "../../utils/chains";
import { deepConvertBigIntAndBigNumber } from "../../utils/misc";
import { useShallow } from "zustand/react/shallow";

export default function CoverRemoveLiqButton({
  disabled,
  poolAddress,
  address,
  positionId,
  claim,
  zeroForOne,
  burnPercent,
  gasLimit,
  closeModal,
  setIsOpen,
}) {
  const [setNeedsRefetch, setNeedsBalance, setNeedsPosRefetch] = useCoverStore(
    useShallow((state) => [
      state.setNeedsRefetch,
      state.setNeedsBalance,
      state.setNeedsPosRefetch,
    ]),
  );

  const [chainId, networkName] = useConfigStore(
    useShallow((state) => [state.chainId, state.networkName]),
  );

  const [toastId, setToastId] = useState(null);

  const { config } = usePrepareContractWrite({
    address: poolAddress,
    abi: coverPoolABI,
    functionName: "burn",
    args: [
      deepConvertBigIntAndBigNumber({
        to: address,
        burnPercent: burnPercent,
        positionId: positionId,
        claim: claim,
        zeroForOne: zeroForOne,
        sync: true,
      }),
    ],
    chainId: chainId,
    enabled: positionId != undefined,
    gasLimit: deepConvertBigIntAndBigNumber(gasLimit),
  });

  const { data, write } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
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
      setNeedsRefetch(true);
      setNeedsPosRefetch(true);
      setNeedsBalance(true);
      setIsOpen(false);
      closeModal();
    },
    onError() {
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
    },
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
        disabled={disabled || gasLimit.lte(BN_ZERO)}
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => {
          address ? write?.() : null;
        }}
      >
        {gasLimit.lte(BN_ZERO) ? <Loader /> : "Remove Liquidity"}
      </button>
    </>
  );
}
