import { BigNumber } from "ethers";
import React, { useEffect, useState } from "react";
import { useTradeStore } from "../../hooks/useTradeStore";
import { getClaimTick } from "../../utils/maps";
import { gasEstimateBurnLimit } from "../../utils/gas";
import { BN_ZERO } from "../../utils/math/constants";
import { useConfigStore } from "../../hooks/useConfigStore";
import { parseUnits } from "../../utils/math/valueMath";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { chainProperties } from "../../utils/chains";
import { useShallow } from "zustand/react/shallow";
import useBurnLimit from "../../hooks/contracts/write/useBurnLimit";
import useSigner from "../../hooks/useSigner";

export default function LimitSwapBurnButton({
  poolAddress,
  address,
  positionId,
  epochLast,
  zeroForOne,
  lower,
  upper,
  burnPercent,
}) {
  const { signer } = useSigner();

  const [networkName, limitSubgraph] = useConfigStore(
    useShallow((state) => [state.networkName, state.limitSubgraph]),
  );

  const router = useRouter();

  const [
    setNeedsRefetch,
    setNeedsBalanceIn,
    setNeedsBalanceOut,
    setNeedsSnapshot,
  ] = useTradeStore(
    useShallow((state) => [
      state.setNeedsRefetch,
      state.setNeedsBalanceIn,
      state.setNeedsBalanceOut,
      state.setNeedsSnapshot,
    ]),
  );
  const [claimTick, setClaimTick] = useState(0);
  const [gasFee, setGasFee] = useState("$0.00");
  const [gasLimit, setGasLimit] = useState(BN_ZERO);

  const updateClaimTick = async () => {
    const tick = await getClaimTick(
      poolAddress,
      Number(lower),
      Number(upper),
      Boolean(zeroForOne),
      Number(epochLast),
      false,
      limitSubgraph,
      undefined,
    );
    setClaimTick(tick);
  };

  const getGasLimit = async () => {
    await gasEstimateBurnLimit(
      poolAddress,
      address,
      burnPercent,
      positionId,
      BigNumber.from(claimTick),
      zeroForOne,
      signer,
      setGasFee,
      setGasLimit,
      limitSubgraph,
    );
  };

  useEffect(() => {
    if (poolAddress && positionId && address && signer) {
      updateClaimTick();
    }
  }, []);

  useEffect(() => {
    if (claimTick > 0 && signer) {
      getGasLimit();
    }
  }, [claimTick, signer]);

  const [toastId, setToastId] = useState(null);

  const onSuccess = () => {
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
    setNeedsSnapshot(true);
    setNeedsBalanceIn(true);
    setNeedsBalanceOut(true);
    setNeedsRefetch(true);
    if (burnPercent.eq(parseUnits("1", 38))) {
      router.push("/");
    }
  };

  const onError = () => {
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
  };

  const { write, data, isLoading } = useBurnLimit({
    poolAddress,
    address,
    burnPercent,
    positionId,
    claim: BigNumber.from(claimTick),
    zeroForOne,
    gasLimit,
    onSuccess,
    onError,
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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-7 text-red-600 bg-red-900/30 p-1 rounded-full cursor-pointer "
        onClick={() => {
          address ? write?.() : null;
        }}
      >
        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
      </svg>
    </>
  );
}
