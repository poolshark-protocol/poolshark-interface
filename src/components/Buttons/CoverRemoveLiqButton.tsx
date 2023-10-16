import { ethers } from "ethers";
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
import { useCoverStore } from "../../hooks/useCoverStore";
import { BN_ZERO } from "../../utils/math/constants";

export default function CoverRemoveLiqButton({
  disabled,
  poolAddress,
  address,
  positionId,
  claim,
  zeroForOne,
  burnPercent,
  gasLimit,
  closeModal,
  setIsOpen,
}) {
  const [setNeedsRefetch, setNeedsBalance, setNeedsPosRefetch] = useCoverStore(
    (state) => [
      state.setNeedsRefetch,
      state.setNeedsBalance,
      state.setNeedsPosRefetch,
    ]
  );

  const [errorDisplay, setErrorDisplay] = useState(false);
  const [successDisplay, setSuccessDisplay] = useState(false);

  const { config } = usePrepareContractWrite({
    address: poolAddress,
    abi: coverPoolABI,
    functionName: "burn",
    args: [
      {
        to: address,
        burnPercent: burnPercent,
        positionId: positionId,
        claim: claim,
        zeroForOne: zeroForOne,
        sync: true,
      },
    ],
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
      setTimeout(() => {
        setNeedsRefetch(true);
        setNeedsPosRefetch(true);
        setIsOpen(false);
        closeModal();
      }, 1000);
      if (burnPercent.eq(ethers.utils.parseUnits("1", 38))) {
        setNeedsRefetch(true);
      }
      setNeedsBalance(true);
      setNeedsPosRefetch(true);
      setIsOpen(false);
    },
    onError() {
      setErrorDisplay(true);
    },
  });

  return (
    <>
      <button
        disabled={disabled || gasLimit.lte(BN_ZERO)}
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => {
          address ? write?.() : null;
        }}
      >
        Remove liquidity
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
