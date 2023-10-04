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
    enabled: amount.gt(BN_ZERO) && poolAddress != undefined,
    chainId: 421613,
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
        className="disabled:opacity-50 text-sm md:text-base disabled:cursor-not-allowed w-full py-4 mx-auto  text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
        onClick={() => write?.()}
      >
        {disabled ? (
          <>
            {buttonState === "amount" ? <>Input Amount</> : <></>}
            {buttonState === "balance" ? (
              <>Insufficient {tokenSymbol} Balance</>
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
