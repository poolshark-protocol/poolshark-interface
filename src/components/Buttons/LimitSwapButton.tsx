import React, { useState, useEffect } from "react";
import { useTradeStore } from "../../hooks/useTradeStore";
import { BN_ZERO } from "../../utils/math/constants";
import { ethers } from "ethers";
import { useConfigStore } from "../../hooks/useConfigStore";
import { toast } from "sonner";
import { chainProperties } from "../../utils/chains";
import { useShallow } from "zustand/react/shallow";
import useMultiMintLimit from "../../hooks/contracts/write/useMultiMintLimit";

export default function LimitSwapButton({
  disabled,
  routerAddress,
  amount,
  lower,
  upper,
  closeModal,
  gasLimit,
  resetAfterSwap,
}) {
  const [chainId, networkName] = useConfigStore(
    useShallow((state) => [state.chainId, state.networkName]),
  );

  const [
    setNeedsRefetch,
    setNeedsAllowanceIn,
    setNeedsBalanceIn,
    setNeedsSnapshot,
    setNeedsPosRefetch,
    tokenIn,
    tokenOut,
  ] = useTradeStore(
    useShallow((state) => [
      state.setNeedsRefetch,
      state.setNeedsAllowanceIn,
      state.setNeedsBalanceIn,
      state.setNeedsSnapshot,
      state.setNeedsPosRefetch,
      state.tokenIn,
      state.tokenOut,
    ]),
  );
  const [toastId, setToastId] = useState(null);

  useEffect(() => {}, [disabled]);

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
    resetAfterSwap();
    setNeedsAllowanceIn(true);
    setNeedsBalanceIn(true);
    setNeedsSnapshot(true);
    setTimeout(() => {
      setNeedsRefetch(true);
      setNeedsPosRefetch(true);
    }, 2500);
    closeModal();
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

  const { data, write, isLoading } = useMultiMintLimit({
    positionId: BN_ZERO,
    lower,
    upper,
    disabled,
    amount,
    gasLimit,
    setTxHash: undefined,
    setIsLoading: undefined,
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

  const ConfirmTransaction = () => {
    write?.();
    window.safary?.track({
      eventType: "swap",
      eventName: "swap-limit",
      parameters: {
        fromAmount: Number(ethers.utils.formatEther(amount)),
        fromCurrency: tokenIn.symbol as string,
        toCurrency: tokenOut.symbol as string,
        contractAddress: routerAddress as string,
        chainId: (chainId as number) || "",
      },
    });
  };

  return (
    <>
      <button
        disabled={disabled}
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={ConfirmTransaction}
      >
        LIMIT SWAP
      </button>
    </>
  );
}
