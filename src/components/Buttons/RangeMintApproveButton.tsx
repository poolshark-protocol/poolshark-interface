import {
  useWaitForTransaction,
  usePrepareContractWrite,
  useContractWrite,
} from "wagmi";
import { erc20ABI } from "wagmi";
import React, { useState, useEffect } from "react";
import { useTradeStore as useRangeLimitStore } from "../../hooks/useTradeStore";
import { useConfigStore } from "../../hooks/useConfigStore";
import { chainProperties } from "../../utils/chains";
import { toast } from "sonner";
import { deepConvertBigIntAndBigNumber } from "../../utils/misc";
import { useShallow } from "zustand/react/shallow";

export default function RangeMintApproveButton({
  routerAddress,
  approveToken,
  amount,
}) {
  const [toastId, setToastId] = useState(null);

  const [chainId, networkName] = useConfigStore(
    useShallow((state) => [state.chainId, state.networkName]),
  );

  const setNeedsAllowanceIn = useRangeLimitStore(
    (state) => state.setNeedsAllowanceIn,
  );

  //* hook wrapper
  const { config: t0 } = usePrepareContractWrite({
    address: approveToken.address,
    abi: erc20ABI,
    functionName: "approve",
    args: [routerAddress, deepConvertBigIntAndBigNumber(amount)],
    chainId: chainId,
  });

  const {
    data: dataT0,
    isSuccess: isSuccesT0,
    write: writeT0,
  } = useContractWrite(t0);

  const { isLoading: isLoadingT0 } = useWaitForTransaction({
    hash: dataT0?.hash,
    onSuccess() {
      toast.success("Your transaction was successful", {
        id: toastId,
        action: {
          label: "View",
          onClick: () =>
            window.open(
              `${chainProperties[networkName]["explorerUrl"]}/tx/${dataT0?.hash}`,
              "_blank",
            ),
        },
      });
      setNeedsAllowanceIn(true);
    },
    onError() {
      toast.error("Your transaction failed", {
        id: toastId,
        action: {
          label: "View",
          onClick: () =>
            window.open(
              `${chainProperties[networkName]["explorerUrl"]}/tx/${dataT0?.hash}`,
              "_blank",
            ),
        },
      });
    },
  });

  useEffect(() => {
    if (isLoadingT0) {
      const newToastId = toast.loading(
        "Your transaction is being confirmed...",
        {
          action: {
            label: "View",
            onClick: () =>
              window.open(
                `${chainProperties[networkName]["explorerUrl"]}/tx/${dataT0?.hash}`,
                "_blank",
              ),
          },
        },
      );
      newToastId;
      setToastId(newToastId);
    }
  }, [isLoadingT0]);

  return (
    <>
      <div
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => writeT0?.()}
      >
        Approve {approveToken.symbol}
      </div>
    </>
  );
}
