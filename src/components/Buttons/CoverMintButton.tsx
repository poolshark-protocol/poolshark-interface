import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { coverPoolABI } from "../../abis/evm/coverPool";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState, useEffect } from "react";
import { roundTick } from "../../utils/math/tickMath";
import { BigNumber } from "ethers";
import { useCoverStore } from "../../hooks/useCoverStore";

export default function CoverMintButton({
  poolAddress,
  disabled,
  to,
  lower,
  upper,
  amount,
  zeroForOne,
  tickSpacing,
  buttonMessage,
  tokenSymbol,
  gasLimit,
}) {
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [successDisplay, setSuccessDisplay] = useState(false);

  const [
    setNeedsRefetch
  ] = useCoverStore((state) => [
    state.setNeedsRefetch
  ]);

  const { config } = usePrepareContractWrite({
    address: poolAddress,
    abi: coverPoolABI,
    functionName: "mint",
    args: [
      [
        to,
        amount,
        BigNumber.from(roundTick(Number(lower), tickSpacing)),
        BigNumber.from(roundTick(Number(upper), tickSpacing)),
        zeroForOne,
      ],
    ],
    overrides: {
      gasLimit: gasLimit,
    },
    enabled: !disabled,
    chainId: 421613,
  });

  const { data, write } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      setSuccessDisplay(true);
      setNeedsRefetch(true);
      console.log("refetch setted")
    },
    onError() {
      setErrorDisplay(true);
    },
  });

  return (
    <>
      <button
        disabled={disabled || gasLimit.lte(BigNumber.from(0))}
        className={
          disabled
            ? "w-full py-4 mx-auto font-medium text-center text-sm md:text-base transition rounded-xl cursor-not-allowed bg-gradient-to-r from-[#344DBF] to-[#3098FF] opacity-50"
            : "w-full py-4 mx-auto font-medium text-center text-sm md:text-base transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
        }
        onClick={() => write?.()}
      >
        {buttonMessage}
      </button>
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
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
