import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useConfigStore } from "../../hooks/useConfigStore";
import { useState, useEffect } from "react";
import { vFinABI } from "../../abis/evm/vFin";
import { toast } from "sonner";
import { chainProperties } from "../../utils/chains";
import { useShallow } from "zustand/react/shallow";

export default function ClaimFinButton({
  vFinAddress,
  positionId,
  claimAmount,
}) {
  const [chainId, networkName] = useConfigStore(
    useShallow((state) => [state.chainId, state.networkName]),
  );

  const [toastId, setToastId] = useState(null);

  const { config } = usePrepareContractWrite({
    address: vFinAddress,
    abi: vFinABI,
    functionName: "claim",
    args: [positionId],
    chainId: chainId,
    enabled: vFinAddress != undefined && positionId != undefined,
    onError() {
      console.log("vFIN claim error");
    },
  });

  const { data, write } = useContractWrite(config);

  const disabled = claimAmount == undefined || claimAmount < 0.005;

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
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => write?.()}
        disabled={disabled}
      >
        {disabled ? "NOTHING TO CLAIM" : "CLAIM VESTED FIN"}
      </button>
    </>
  );
}
