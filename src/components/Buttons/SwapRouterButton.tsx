import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useAccount,
} from "wagmi";
import React, { useState } from "react";
import { useTradeStore as useRangeLimitStore } from "../../hooks/useTradeStore";
import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";
import { useConfigStore } from "../../hooks/useConfigStore";
import { getSwapRouterButtonMsgValue } from "../../utils/buttons";
import { chainProperties } from "../../utils/chains";
import { toast } from "sonner";
import { useEffect } from "react";
import { BigNumber, ethers } from "ethers";
import { formatCurrency } from "@usedapp/core/dist/esm/src/model";

declare global {
  interface Window {
    safary?: {
      track: (args: {
        eventType: string
        eventName: string
        parameters?: { [key: string]: string | number | boolean | BigNumber }
      }) => void
    }
  }
}

export default function SwapRouterButton({
  disabled,
  routerAddress,
  poolAddresses,
  amountIn,
  tokenInNative,
  tokenOutNative,
  swapParams,
  gasLimit,
  tokenInSymbol,
  tokenOutSymbol,
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

  const [setNeedsAllowanceIn, setNeedsBalanceIn, setNeedsBalanceOut, tradeButton] = useRangeLimitStore(
    (state) => [state.setNeedsAllowanceIn, state.setNeedsBalanceIn, state.setNeedsBalanceOut, state.tradeButton]
  );

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


  const ConfirmTransaction = (address) => {
    if (address) {
      write?.();
    }
    window.safary?.track({
      eventType: 'swap',
      eventName: 'swap-main',
      parameters: {
        fromAmount: Number(ethers.utils.formatEther(amountIn)),
        fromCurrency: (tokenInSymbol as string),
        toCurrency: (tokenOutSymbol as string),
        contractAddress: (routerAddress as string),
        chainId: (chainId as number) || '',
      },
    })
  };

  return (
    <>
      <button
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        disabled={disabled}
        onClick={ConfirmTransaction}
      >
        { disabled && tradeButton.buttonMessage != '' ? tradeButton.buttonMessage : "Swap" }
      </button>
    </>
  );
}
