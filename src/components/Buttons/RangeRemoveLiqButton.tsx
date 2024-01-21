import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState } from "react";
import { rangePoolABI } from "../../abis/evm/rangePool";
import { BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import Loader from "../Icons/Loader";
import { useConfigStore } from "../../hooks/useConfigStore";
import { chainProperties } from "../../utils/chains";
import { rangeStakerABI } from "../../abis/evm/rangeStaker";
import { getRangeStakerAddress } from "../../utils/config";

export default function RangeRemoveLiqButton({
  poolAddress,
  address,
  positionId,
  burnPercent,
  closeModal,
  setIsOpen,
  gasLimit,
  staked,
  disabled,
}) {
  const [
    chainId,
    networkName
  ] = useConfigStore((state) => [
    state.chainId,
    state.networkName
  ]);

  const [
    setNeedsRefetch,
    setNeedsBalanceIn,
    setNeedsBalanceOut,
    setNeedsPosRefetch,
  ] = useRangeLimitStore((state) => [
    state.setNeedsRefetch,
    state.setNeedsBalanceIn,
    state.setNeedsBalanceOut,
    state.setNeedsPosRefetch,
  ]);

  const [errorDisplay, setErrorDisplay] = useState(false);
  const [successDisplay, setSuccessDisplay] = useState(false);

  const { config: burnConfig } = usePrepareContractWrite({
    address: poolAddress,
    abi: rangePoolABI,
    functionName: "burnRange",
    enabled: positionId != undefined 
              && staked != undefined 
              && !staked 
              && poolAddress != ZERO_ADDRESS,
    args:[[
        address,
        positionId,
        burnPercent
      ]],
    chainId: chainId,
    onError(err) {
      console.log('compound error')
    },
  });

  const { config: burnStakeConfig } = usePrepareContractWrite({
    address: getRangeStakerAddress(networkName),
    abi: rangeStakerABI,
    functionName: "burnRangeStake",
    args: [
      poolAddress,
      {
        to: address,
        positionId: positionId,
        burnPercent: burnPercent
      }
    ],
    chainId: chainId,
    enabled: positionId != undefined 
              && staked != undefined
              && staked
              && poolAddress != ZERO_ADDRESS,
    onError(err) {
        console.log('compound stake errored')
    },
  });

  const { data: burnData, write: burnWrite } = useContractWrite(burnConfig)
  const { data: burnStakeData, write: burnStakeWrite } = useContractWrite(burnStakeConfig)

  const data = !staked ? burnData : burnStakeData
  const write = !staked ? burnWrite : burnStakeWrite

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      setSuccessDisplay(true);
      setNeedsBalanceIn(true);
      setTimeout(() => {
        setNeedsRefetch(true);
        setNeedsPosRefetch(true);
        closeModal();
        setIsOpen(false);
      }, 2000);
    },
    onError() {
      setErrorDisplay(true);
    },
  });

  return (
    <>
      <button
        disabled={disabled}
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => {
          address ? write?.() : null;
        }}
      >
        {gasLimit.lte(BN_ZERO) ? <Loader/> : "Remove liquidity"}
      </button>
      <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-50">
        {errorDisplay && (
          <ErrorToast
            hash={data?.hash}
            errorDisplay={errorDisplay}
            setErrorDisplay={setErrorDisplay}
          />
        )}
        {isLoading ? <ConfirmingToast hash={data?.hash} /> : <></>}
        {successDisplay && (
          <SuccessToast
            hash={data?.hash}
            successDisplay={successDisplay}
            setSuccessDisplay={setSuccessDisplay}
          />
        )}
      </div>
    </>
  );
}
