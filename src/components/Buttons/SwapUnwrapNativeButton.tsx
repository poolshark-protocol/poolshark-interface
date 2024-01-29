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
import { weth9ABI } from "../../abis/evm/weth9";
import { parseEther } from "ethers/lib/utils.js";
import { BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import { chainProperties } from "../../utils/chains";
import { toast } from "sonner";
import { useEffect } from "react";
  
  export default function SwapUnwrapNativeButton({
    disabled,
    routerAddress,
    wethAddress,
    tokenInSymbol,
    amountIn,
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
  
    const [setNeedsAllowanceIn, setNeedsBalanceIn, setNeedsBalanceOut, tradeButton] = useRangeLimitStore(
      (state) => [state.setNeedsAllowanceIn, state.setNeedsBalanceIn, state.setNeedsBalanceOut, state.tradeButton]
    );

    const [toastId, setToastId] = useState(null);
  
    const { address } = useAccount();
    const userAddress = address;
  
    const { config } = usePrepareContractWrite({
      address: wethAddress,
      abi: weth9ABI,
      functionName: "withdraw",
      args: [amountIn],
      enabled: routerAddress != undefined && wethAddress != ZERO_ADDRESS,
      chainId: chainId,
      overrides: {
        gasLimit: gasLimit,
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
  
    return (
      <>
        <button
          className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
          disabled={disabled || gasLimit.lte(BN_ZERO)}
          onClick={(address) => (address ? write?.() : null)}
        >
          { disabled && tradeButton.buttonMessage != '' ? tradeButton.buttonMessage : 'Unwrap ' + tokenInSymbol }
        </button>
      </>
    );
  }
  