import { BigNumber } from "ethers";
import React, { useEffect, useState } from "react";
import { getClaimTick } from "../../utils/maps";
import { gasEstimateBurnLimit } from "../../utils/gas";
import { BN_ZERO } from "../../utils/math/constants";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import Loader from "../Icons/Loader";
import { useConfigStore } from "../../hooks/useConfigStore";
import { parseUnits } from "../../utils/math/valueMath";
import { toast } from "sonner";
import { chainProperties } from "../../utils/chains";
import { useShallow } from "zustand/react/shallow";
import useBurnLimit from "../../hooks/contracts/write/useBurnLimit";
import useSigner from "../../hooks/useSigner";

export default function LimitRemoveLiqButton({
  poolAddress,
  address,
  positionId,
  epochLast,
  zeroForOne,
  lower,
  upper,
  burnPercent,
  closeModal,
  setIsOpen,
}) {
  const { signer } = useSigner();

  const [chainId, networkName, limitSubgraph] = useConfigStore(
    useShallow((state) => [
      state.chainId,
      state.networkName,
      state.limitSubgraph,
    ]),
  );

  const [
    limitPositionData,
    setNeedsRefetch,
    setNeedsBalanceIn,
    setNeedsBalanceOut,
    setNeedsSnapshot,
  ] = useRangeLimitStore(
    useShallow((state) => [
      state.limitPositionData,
      state.setNeedsRefetch,
      state.setNeedsBalanceIn,
      state.setNeedsBalanceOut,
      state.setNeedsSnapshot,
    ]),
  );
  const [claimTick, setClaimTick] = useState(undefined);
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

  async function getGasLimit() {
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
  }

  useEffect(() => {
    if (poolAddress && positionId && address && signer) {
      updateClaimTick();
    }
  }, []);

  useEffect(() => {
    if (
      signer != undefined &&
      claimTick >= Number(limitPositionData.min) &&
      claimTick <= Number(limitPositionData.max)
    ) {
      getGasLimit();
    }
  }, [claimTick, signer, burnPercent]);

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
    if (burnPercent.eq(parseUnits("1", 38))) {
      setTimeout(() => {
        setNeedsRefetch(true);
      }, 1000);
    }
    setTimeout(() => {
      setNeedsBalanceIn(true);
      setNeedsBalanceOut(true);
      setNeedsSnapshot(true);
      setIsOpen(false);
      closeModal();
    }, 1000);
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
    claim: BigNumber.from(claimTick ?? 0),
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
      <button
        disabled={gasLimit.lte(BN_ZERO) || claimTick == undefined}
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center flex items-center justify-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => {
          address ? write?.() : null;
        }}
      >
        {gasLimit.lte(BN_ZERO) ? <Loader /> : "Remove liquidity"}
      </button>
    </>
  );
}
