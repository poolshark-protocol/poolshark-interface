import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useAccount,
  usePrepareSendTransaction,
  useSendTransaction,
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
import { BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";

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

  const [errorDisplay, setErrorDisplay] = useState(false);
  const [successDisplay, setSuccessDisplay] = useState(false);

  const { address } = useAccount();
  const userAddress = address;

  const { config: psharkConfig } = usePrepareContractWrite({
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
    onError() {
      console.log('multi swap error')
    }
  });

  const { data: psharkData, write: psharkWrite } = useContractWrite(psharkConfig);

  const { config: openoceanConfig } = usePrepareSendTransaction({
    request: {
      to: routerAddress,
      data: tradeSdk.swapCalldata,
      value: getSwapRouterButtonMsgValue(
        tokenInNative,
        tokenOutNative,
        amountIn,
        tradeSdk
      )
    },
    enabled: tradeSdk.enabled && 
             tradeSdk.swapCalldata != ZERO_ADDRESS &&
             amountIn.gt(BN_ZERO) && !disabled,
    onSuccess() {
      // console.log('success configuring openocean call')
    },
    onError() {
      console.log('open ocean error', getSwapRouterButtonMsgValue(
        tokenInNative,
        tokenOutNative,
        amountIn,
        tradeSdk
      ).toString(), amountIn, tradeSdk.swapCalldata != ZERO_ADDRESS)
    }
  });

  const { data: openoceanData, sendTransaction: openoceanWrite } = useSendTransaction(openoceanConfig);

  const data = tradeSdk.enabled ? openoceanData : psharkData
  const write = tradeSdk.enabled ? openoceanWrite : psharkWrite

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
        disabled={disabled}
        onClick={(address) => (address ? write?.() : null)}
      >
        { disabled && tradeButton.buttonMessage != '' ? tradeButton.buttonMessage : "Swap" }
      </button>
    </>
  );
}
