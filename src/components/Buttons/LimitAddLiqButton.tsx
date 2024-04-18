import React, { useState, useEffect } from "react";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { useConfigStore } from "../../hooks/useConfigStore";
import { toast } from "sonner";
import { chainProperties } from "../../utils/chains";
import { useShallow } from "zustand/react/shallow";
import useMultiMintLimit from "../../hooks/contracts/write/useMultiMintLimit";

export default function LimitAddLiqButton({
  disabled,
  amount,
  lower,
  upper,
  positionId,
  gasLimit,
  setIsOpen,
  buttonState,
  tokenSymbol,
}) {
  const [chainId, networkName] = useConfigStore(
    useShallow((state) => [state.chainId, state.networkName]),
  );

  const [
    setNeedsRefetch,
    setNeedsAllowanceIn,
    setNeedsBalanceIn,
    setNeedsSnapshot,
  ] = useRangeLimitStore(
    useShallow((state) => [
      state.setNeedsRefetch,
      state.setNeedsAllowanceIn,
      state.setNeedsBalanceIn,
      state.setNeedsSnapshot,
    ]),
  );
  const [toastId, setToastId] = useState(null);

  useEffect(() => {}, [disabled]);

  const [txHash, setTxHash] = useState();
  const [isLoading, setIsLoading] = useState(false);

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
    setNeedsSnapshot(true);
    setNeedsAllowanceIn(true);
    setNeedsBalanceIn(true);
    setTimeout(() => {
      setNeedsRefetch(true);
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

  const { data, write } = useMultiMintLimit({
    positionId,
    lower,
    upper,
    disabled,
    amount,
    gasLimit,
    setTxHash,
    setIsLoading,
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
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => write?.()}
      >
        {disabled ? (
          <>
            {buttonState === "amount" ? <>Input Amount</> : <></>}
            {buttonState === "balance" ? <>Low {tokenSymbol} Balance</> : <></>}
          </>
        ) : (
          <> Add Liquidity</>
        )}
      </button>
    </>
  );
}
