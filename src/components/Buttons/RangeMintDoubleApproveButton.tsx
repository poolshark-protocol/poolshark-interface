import {
  useWaitForTransaction,
  usePrepareContractWrite,
  useContractWrite,
} from "wagmi";
import { erc20ABI } from "wagmi";
import React, { useEffect, useState } from "react";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { useConfigStore } from "../../hooks/useConfigStore";
import { chainProperties } from "../../utils/chains";
import { toast } from "sonner";
import { deepConvertBigIntAndBigNumber } from "../../utils/misc";
import { useShallow } from "zustand/react/shallow";

export default function RangeMintDoubleApproveButton({
  routerAddress,
  tokenIn,
  tokenOut,
  amount0,
  amount1,
}) {
  const [toastIdT0, setToastIdT0] = useState(null);
  const [toastIdT1, setToastIdT1] = useState(null);

  const [chainId, networkName] = useConfigStore(
    useShallow((state) => [state.chainId, state.networkName]),
  );

  const [setNeedsAllowanceIn, setNeedsAllowanceOut] = useRangeLimitStore(
    useShallow((state) => [
      state.setNeedsAllowanceIn,
      state.setNeedsAllowanceOut,
    ]),
  );

  const { config: t0 } = usePrepareContractWrite({
    address: tokenIn.address,
    abi: erc20ABI,
    functionName: "approve",
    args: [routerAddress, deepConvertBigIntAndBigNumber(amount0)],
    chainId: chainId,
  });

  const { config: t1 } = usePrepareContractWrite({
    address: tokenOut.address,
    abi: erc20ABI,
    functionName: "approve",
    args: [routerAddress, deepConvertBigIntAndBigNumber(amount1)],
    chainId: chainId,
  });

  const {
    data: dataT0,
    isSuccess: isSuccesT0,
    write: writeT0,
  } = useContractWrite(t0);

  const {
    data: dataT1,
    isSuccess: isSuccesT1,
    write: writeT1,
  } = useContractWrite(t1);

  const { isLoading: isLoadingT0 } = useWaitForTransaction({
    hash: dataT0?.hash,
    onSuccess() {
      toast.success("Your transaction was successful", {
        id: toastIdT0,
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
        id: toastIdT0,
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

  const { isLoading: isLoadingT1 } = useWaitForTransaction({
    hash: dataT1?.hash,
    onSuccess() {
      toast.success("Your transaction was successful", {
        id: toastIdT1,
        action: {
          label: "View",
          onClick: () =>
            window.open(
              `${chainProperties[networkName]["explorerUrl"]}/tx/${dataT1?.hash}`,
              "_blank",
            ),
        },
      });
      setNeedsAllowanceOut(true);
    },
    onError() {
      toast.error("Your transaction failed", {
        id: toastIdT1,
        action: {
          label: "View",
          onClick: () =>
            window.open(
              `${chainProperties[networkName]["explorerUrl"]}/tx/${dataT1?.hash}`,
              "_blank",
            ),
        },
      });
    },
  });

  function approve() {
    writeT0();
    writeT1();
  }

  useEffect(() => {
    if (isLoadingT1) {
      const newToastIdT1 = toast.loading(
        "Your transaction is being confirmed...",
        {
          action: {
            label: "View",
            onClick: () =>
              window.open(
                `${chainProperties[networkName]["explorerUrl"]}/tx/${dataT1?.hash}`,
                "_blank",
              ),
          },
        },
      );
      newToastIdT1;
      setToastIdT1(newToastIdT1);
    }
    if (isLoadingT0) {
      const newToastIdT0 = toast.loading(
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
      newToastIdT0;
      setToastIdT0(newToastIdT0);
    }
  }, [isLoadingT1, isLoadingT0]);

  return (
    <>
      <div
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={(address) => (address ? approve() : null)}
      >
        Approve Both Tokens
      </div>
    </>
  );
}
