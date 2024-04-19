import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import React, { useState, useEffect } from "react";
import { BN_ZERO } from "../../utils/math/constants";
import { useCoverStore } from "../../hooks/useCoverStore";
import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";
import { ethers } from "ethers";
import Loader from "../Icons/Loader";
import { useConfigStore } from "../../hooks/useConfigStore";
import { toast } from "sonner";
import { chainProperties } from "../../utils/chains";
import { deepConvertBigIntAndBigNumber } from "../../utils/misc";
import { useShallow } from "zustand/react/shallow";

export default function CoverAddLiqButton({
  poolAddress,
  routerAddress,
  address,
  positionId,
  lower,
  upper,
  zeroForOne,
  amount,
  toAddress,
  gasLimit,
  buttonState,
  disabled,
  tokenSymbol,
  setIsOpen,
}) {
  const [chainId, networkName] = useConfigStore(
    useShallow((state) => [state.chainId, state.networkName]),
  );
  const [
    coverPoolData,
    setNeedsAllowance,
    setNeedsBalance,
    setNeedsRefetch,
    setNeedsPosRefetch,
  ] = useCoverStore(
    useShallow((state) => [
      state.coverPoolData,
      state.setNeedsAllowance,
      state.setNeedsBalance,
      state.setNeedsRefetch,
      state.setNeedsPosRefetch,
    ]),
  );
  const [toastId, setToastId] = useState(null);

  const { config } = usePrepareContractWrite({
    address: routerAddress,
    abi: poolsharkRouterABI,
    functionName: "multiMintCover",
    args: [
      [poolAddress],
      [
        deepConvertBigIntAndBigNumber({
          positionId: positionId,
          to: toAddress,
          amount: amount,
          lower: lower,
          upper: upper,
          zeroForOne: zeroForOne,
          callbackData: ethers.utils.formatBytes32String(""),
        }),
      ],
    ],
    enabled:
      amount.gt(BN_ZERO) && poolAddress != undefined && positionId != undefined,
    chainId: chainId,
    gasLimit: deepConvertBigIntAndBigNumber(gasLimit),
  });

  const { data, isSuccess, write } = useContractWrite(config);

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
      setNeedsAllowance(true);
      setNeedsBalance(true);
      setIsOpen(false);
      setNeedsRefetch(true);
      setTimeout(() => {
        setNeedsRefetch(true);
        setNeedsPosRefetch(true);
        setIsOpen(false);
      }, 1000);
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
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full flex items-center justify-center border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => write?.()}
      >
        {gasLimit.lte(BN_ZERO) && amount?.gt(BN_ZERO) ? (
          <Loader />
        ) : disabled ? (
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
