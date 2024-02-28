import { BigNumber, ethers } from "ethers";
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import React, { useEffect, useState } from "react";
import { limitPoolABI } from "../../abis/evm/limitPool";
import { getClaimTick } from "../../utils/maps";
import { gasEstimateBurnLimit } from "../../utils/gas";
import { BN_ZERO } from "../../utils/math/constants";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import Loader from "../Icons/Loader";
import { useConfigStore } from "../../hooks/useConfigStore";
import { parseUnits } from "../../utils/math/valueMath";
import { toast } from "sonner";
import { chainProperties } from "../../utils/chains";
import { useEthersSigner } from "../../utils/viemEthersAdapters";

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
  const signer = useEthersSigner()

  const [
    chainId,
    networkName,
    limitSubgraph
  ] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
    state.limitSubgraph
  ]);

  const [
    limitPositionData,
    tokenIn,
    setNeedsRefetch, 
    setNeedsBalanceIn, 
    setNeedsBalanceOut, 
    setNeedsSnapshot
  ] = useRangeLimitStore(
    (state) => [
      state.limitPositionData,
      state.tokenIn,
      state.setNeedsRefetch,
      state.setNeedsBalanceIn,
      state.setNeedsBalanceOut,
      state.setNeedsSnapshot,
    ]
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
      undefined
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
    );
  };

  useEffect(() => {
    if(poolAddress && positionId && address && signer) {
      updateClaimTick();
    }
  }, []);

  useEffect(() => {
    if (signer != undefined && 
        claimTick >= Number(limitPositionData.min) &&
        claimTick <= Number(limitPositionData.max)) {
      getGasLimit();
    }
  }, [claimTick, signer, burnPercent]);

  const [toastId, setToastId] = useState(null);

  const { config } = usePrepareContractWrite({
    address: poolAddress,
    abi: limitPoolABI,
    functionName: "burnLimit",
    args: [
      {
        to: address,
        burnPercent: burnPercent,
        positionId: positionId,
        claim: BigNumber.from(claimTick),
        zeroForOne: zeroForOne
      },
    ],
    enabled: positionId != undefined,
    chainId: chainId,
    gasLimit,
  });

  const { data, isSuccess, write } = useContractWrite(config);

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
        disabled={gasLimit.lte(BN_ZERO)}
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center flex items-center justify-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => {
          address ? write?.() : null;
        }}
      >
        {gasLimit.lte(BN_ZERO) ? <Loader/> :"Remove liquidity"}
        
      </button>
    </>
  );
}