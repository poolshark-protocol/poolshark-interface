import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { coverPoolABI } from "../../abis/evm/coverPool";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState } from "react";
import { BN_ZERO } from "../../utils/math/constants";
import { useCoverStore } from "../../hooks/useCoverStore";
import { poolsharkRouterABI } from "../../abis/evm/poolsharkRouter";
import { ethers } from "ethers";
import Loader from "../Icons/Loader";
import { useConfigStore } from "../../hooks/useConfigStore";

export default function CoverAddLiqButton({
  poolAddress,
  routerAddress,
  address,
  positionId,
  lower,
  upper,
  zeroForOne,
  amount,
  toAddress,
  gasLimit,
  buttonState,
  disabled,
  tokenSymbol,
  setIsOpen,
}) {
  const [
    chainId,
    networkName
  ] = useConfigStore((state) => [
    state.chainId,
    state.networkName
  ]);
  const [
    coverPoolData,
    setNeedsAllowance,
    setNeedsBalance,
    setNeedsRefetch,
    setNeedsPosRefetch,
  ] = useCoverStore((state) => [
    state.coverPoolData,
    state.setNeedsAllowance,
    state.setNeedsBalance,
    state.setNeedsRefetch,
    state.setNeedsPosRefetch,
  ]);
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [successDisplay, setSuccessDisplay] = useState(false);

  const { config } = usePrepareContractWrite({
    address: routerAddress,
    abi: poolsharkRouterABI,
    functionName: "multiMintCover",
    args: [
      [poolAddress],
      [
        {
          positionId: positionId,
          to: toAddress,
          amount: amount,
          lower: lower,
          upper: upper,
          zeroForOne: zeroForOne,
          callbackData: ethers.utils.formatBytes32String(""),
        },
      ],
    ],
    enabled: amount.gt(BN_ZERO) && poolAddress != undefined && positionId != undefined,
    chainId: chainId,
    overrides: {
      gasLimit: gasLimit,
    },
  });

  const { data, isSuccess, write } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      setSuccessDisplay(true);
      setNeedsAllowance(true);
      setNeedsBalance(true);
      setIsOpen(false);
      setNeedsRefetch(true);
      setTimeout(() => {
        setNeedsRefetch(true);
        setNeedsPosRefetch(true);
        setIsOpen(false);
      }, 1000);
    },
    onError() {
      setErrorDisplay(true);
    },
  });

  return (
    <>
      <button
        disabled={disabled || gasLimit.lte(BN_ZERO)}
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full flex items-center justify-center border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => write?.()}
      >
        {gasLimit.lte(BN_ZERO) && amount?.gt(BN_ZERO) ? (
          <Loader />
        ) : disabled ? (
          <>
            {buttonState === "amount" ? <>Input Amount</> : <></>}
            {buttonState === "balance" ? (
              <>Low {tokenSymbol} Balance</>
            ) : (
              <></>
            )}
          </>
        ) : (
          <> Add Liquidity</>
        )}
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
