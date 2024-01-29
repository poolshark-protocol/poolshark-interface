import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { useConfigStore } from "../../hooks/useConfigStore";
import { bondTellerABI } from "../../abis/evm/bondTeller";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { chainProperties } from "../../utils/chains";

export default function RedeemBondButton({
  tellerAddress,
  tokenId,
  amount,
  disabled,
  setNeedsBondTokenData,
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
    address: tellerAddress,
    abi: bondTellerABI,
    functionName: "redeem",
    args: [
      tokenId,
      amount,
    ],
    chainId: chainId,
    onError() {
      console.log('redeem error')
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
      setNeedsBondTokenData(true);
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
          className="bg-main1 border border-main text-xs py-1 px-5 rounded-[4px] disabled:opacity-50 hover:opacity-80"
          disabled={disabled}
          onClick={() => {address ? write?.() : null}}>
          REDEEM
        </button>
      </>
    );
  }
  