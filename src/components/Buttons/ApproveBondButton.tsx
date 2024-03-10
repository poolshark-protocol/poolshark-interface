import { erc20ABI, useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { useConfigStore } from "../../hooks/useConfigStore";
import { useState, useEffect } from "react";
import { BN_ZERO } from "../../utils/math/constants";
import { toast } from "sonner";
import { chainProperties } from "../../utils/chains";
  
  export default function ApproveBondButton({
    tellerAddress,
    wethAddress,
    inputAmount,
    setNeedsAllowance,
  }) {
    const [
      chainId,
      networkName
    ] = useConfigStore((state) => [
      state.chainId,
      state.networkName
    ]);

    const [toastId, setToastId] = useState(null);

    const { address } = useAccount();
    
    const { config } = usePrepareContractWrite({
      address: wethAddress,
      abi: erc20ABI,
      functionName: "approve",
      args: [
        tellerAddress,
        inputAmount,
      ],
      chainId: chainId,
      enabled: tellerAddress != undefined && inputAmount?.gt(BN_ZERO),
      onError() {
        console.log('approve error', tellerAddress, inputAmount)
      }
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
        setNeedsAllowance(true);
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
          className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
          onClick={() => {address ? write?.() : null}}
        >
          APPROVE W{chainProperties[networkName]?.nativeCurrency?.symbol ?? 'ETH'}
        </button>
      </>
    );
  }