import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useAccount,
  usePrepareSendTransaction,
} from "wagmi";
import React, { useState } from "react";
import { useTradeStore } from "../../hooks/useTradeStore";
import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";
import { useConfigStore } from "../../hooks/useConfigStore";
import { getSwapRouterButtonMsgValue } from "../../utils/buttons";
import { chainProperties } from "../../utils/chains";
import { toast } from "sonner";
import { useEffect } from "react";
import { parseEther } from "ethers/lib/utils.js";

export default function SwapRouterButton({
  disabled,
  routerAddress,
  poolAddresses,
  amountIn,
  tokenInNative,
  tokenOutNative,
  swapParams,
  gasLimit,
  resetAfterSwap
}) {
  const [
    chainId,
    networkName
  ] = useConfigStore((state) => [
    state.chainId,
    state.networkName
  ]);

  const [toastId, setToastId] = useState(null);

  const [
    setNeedsRefetch,
    setNeedsAllowanceIn,
    setNeedsBalanceIn,
    setNeedsBalanceOut,
    setNeedsSnapshot,
    setNeedsPosRefetch,
    tokenIn,
    tokenOut,
    tradeButton,
    tradeSdk,
  ] = useTradeStore((state) => [
    state.setNeedsRefetch,
    state.setNeedsAllowanceIn,
    state.setNeedsBalanceIn,
    state.setNeedsBalanceOut,
    state.setNeedsSnapshot,
    state.setNeedsPosRefetch,
    state.tokenIn,
    state.tokenOut,
    state.tradeButton,
    state.tradeSdk,
  ]);

  console.log('swap router button')

  const [errorDisplay, setErrorDisplay] = useState(false);
  const [successDisplay, setSuccessDisplay] = useState(false);

  const { address } = useAccount();
  const userAddress = address;

  const { config } = usePrepareContractWrite({
    address: routerAddress,
    abi: poolsharkRouterABI,
    functionName: "multiSwapSplit",
    args: [poolAddresses, swapParams],
    enabled: poolAddresses.length > 0 && swapParams.length > 0,
    chainId: chainId,
    overrides: {
      gasLimit: gasLimit,
      value: getSwapRouterButtonMsgValue(
        tokenInNative,
        tokenOutNative,
        amountIn
      )
    },
  });

  const { data, write } = useContractWrite(config);

  // const data = tradeSdk.enabled ? exchangeData : approveData
  // const write = tradeSdk.enabled ? exchangeWrite : approveWrite

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      toast.success("Your transaction was successful",{
        id: toastId,
        action: {
          label: "View",
          onClick: () => window.open(`${chainProperties[networkName]["explorerUrl"]}/tx/${data?.hash}`, '_blank'),
        },
      });
      resetAfterSwap()
      setNeedsAllowanceIn(true);
      setNeedsBalanceIn(true);
      setNeedsBalanceOut(true);
      setTimeout(() => {
        setNeedsSnapshot(true);
        setNeedsRefetch(true);
        setNeedsPosRefetch(true);
      }, 2500);
    },
    onError() {
      toast.error("Your transaction failed",{
        id: toastId,
        action: {
          label: "View",
          onClick: () => window.open(`${chainProperties[networkName]["explorerUrl"]}/tx/${data?.hash}`, '_blank'),
        },
      });
    },
  });

  useEffect(() => {
    if(isLoading) {
      const newToastId = toast.loading("Your transaction is being confirmed...",{
        action: {
          label: "View",
          onClick: () => window.open(`${chainProperties[networkName]["explorerUrl"]}/tx/${data?.hash}`, '_blank'),
        },
      });
      newToastId
      setToastId(newToastId);
    }
  }, [isLoading]);

  return (
    <>
      <button
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        disabled={disabled && !tradeSdk.enabled}
        onClick={(address) => (address ? write?.() : null)}
      >
        { disabled && tradeButton.buttonMessage != '' ? tradeButton.buttonMessage : "Swap" }
      </button>
    </>
  );
}
