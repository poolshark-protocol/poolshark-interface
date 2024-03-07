import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import React, { useState, useEffect } from "react";
import { BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { BigNumber, ethers } from "ethers";
import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";
import Loader from "../Icons/Loader";
import { useConfigStore } from "../../hooks/useConfigStore";
import { getRangeMintInputData } from "../../utils/buttons";
import { chainProperties } from "../../utils/chains";
import { getRangeStakerAddress } from "../../utils/config";
import { toast } from "sonner";
import { useEthersSigner } from "../../utils/viemEthersAdapters";
import { convertBigIntAndBigNumber, deepConvertBigIntAndBigNumber } from "../../utils/misc";

export default function RangeAddLiqButton({
  routerAddress,
  poolAddress,
  address,
  lower,
  upper,
  positionId,
  amount0,
  amount1,
  disabled,
  setIsOpen,
  gasLimit,
}) {
  const [
    chainId,
    networkName
  ] = useConfigStore((state) => [
    state.chainId,
    state.networkName
  ]);

  const [
    rangePositionData,
    rangeMintParams,
    setNeedsAllowanceIn,
    setNeedsAllowanceOut,
    setNeedsBalanceIn,
    setNeedsBalanceOut,
    setNeedsRefetch,
    setNeedsPosRefetch,
  ] = useRangeLimitStore((state) => [
    state.rangePositionData,
    state.rangeMintParams,
    state.setNeedsAllowanceIn,
    state.setNeedsAllowanceOut,
    state.setNeedsBalanceIn,
    state.setNeedsBalanceOut,
    state.setNeedsRefetch,
    state.setNeedsPosRefetch,
  ]);
  const [toastId, setToastId] = useState(null);

  const signer = useEthersSigner()

  const { config } = usePrepareContractWrite({
    address: routerAddress,
    abi: poolsharkRouterABI,
    functionName: "multiMintRange",
    args: [
      [poolAddress],
      [
        deepConvertBigIntAndBigNumber({
          to: address,
          lower: lower,
          upper: upper,
          positionId: positionId,
          amount0: amount0,
          amount1: amount1,
          callbackData: getRangeMintInputData(rangePositionData.staked, getRangeStakerAddress(networkName)),
        }),
      ],
    ],
    chainId: chainId,
    enabled: positionId != undefined && poolAddress != ZERO_ADDRESS,
    gasLimit: convertBigIntAndBigNumber(gasLimit),
    onError(err) {
      console.log('range add liq error')  
    },
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
      setNeedsAllowanceIn(true);
      setNeedsBalanceIn(true);
      setTimeout(() => {
        setNeedsRefetch(true);
        setNeedsPosRefetch(true);
        setIsOpen(false);
      }, 2500);
      if (amount1.gt(BigNumber.from(0))) {
        setNeedsAllowanceOut(true);
        setNeedsBalanceOut(true);
      }
    },
    onError() {
      toast.error("Your transaction failed",{
        id: toastId,
        action: {
          label: "View",
          onClick: () => window.open(`${chainProperties[networkName]["explorerUrl"]}/tx/${data?.hash}`, '_blank'),
        },
      });
      setNeedsRefetch(false);
      setNeedsPosRefetch(false);
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
        disabled={gasLimit.lte(BN_ZERO) || disabled}
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition flex items-center justify-center rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => {
          address ? write?.() : null;
        }}
      >
        {(gasLimit?.lte(BN_ZERO) && !rangeMintParams.disabled) ? <Loader/> 
                                                               : (rangeMintParams.buttonMessage != "Mint Range Position" 
                                                                  ? rangeMintParams.buttonMessage
                                                                  : "Add liquidity")}
      </button>
    </>
  );
}
