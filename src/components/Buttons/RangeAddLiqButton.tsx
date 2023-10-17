import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useSigner,
} from "wagmi";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState } from "react";
import { BN_ZERO } from "../../utils/math/constants";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { BigNumber, ethers } from "ethers";
import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";
import Loader from "../Icons/Loader";
import { useConfigStore } from "../../hooks/useConfigStore";

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
    chainId
  ] = useConfigStore((state) => [
    state.chainId,
  ]);

  const [
    setNeedsAllowanceIn,
    setNeedsAllowanceOut,
    setNeedsBalanceIn,
    setNeedsBalanceOut,
    setNeedsRefetch,
    setNeedsPosRefetch,
  ] = useRangeLimitStore((state) => [
    state.setNeedsAllowanceIn,
    state.setNeedsAllowanceOut,
    state.setNeedsBalanceIn,
    state.setNeedsBalanceOut,
    state.setNeedsRefetch,
    state.setNeedsPosRefetch,
  ]);
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [successDisplay, setSuccessDisplay] = useState(false);
  const [fetchDelay, setFetchDelay] = useState(false);

  const { data: signer } = useSigner();

  const { config } = usePrepareContractWrite({
    address: routerAddress,
    abi: poolsharkRouterABI,
    functionName: "multiMintRange",
    args: [
      [poolAddress],
      [
        {
          to: address,
          lower: lower,
          upper: upper,
          positionId: positionId,
          amount0: amount0,
          amount1: amount1,
          callbackData: ethers.utils.formatBytes32String(""),
        },
      ],
    ],
    chainId: chainId,
    overrides: {
      gasLimit: gasLimit,
    },
    onSuccess() {},
  });

  const { data, isSuccess, write } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      setSuccessDisplay(true);
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
      setErrorDisplay(true);
      setNeedsRefetch(false);
      setNeedsPosRefetch(false);
    },
  });
  return (
    <>
      <button
        disabled={gasLimit.lte(BN_ZERO) || disabled}
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition flex items-center justify-center rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => {
          address ? write?.() : null;
        }}
      >
        {gasLimit.lte(BN_ZERO) ? <Loader/> : "Add liquidity"}
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
