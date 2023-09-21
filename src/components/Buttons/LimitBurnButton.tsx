import { ethers } from "ethers";
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState } from "react";
import { limitPoolABI } from "../../abis/evm/limitPool";
import { useTradeStore } from "../../hooks/useTradeStore";

export default function LimitBurnButton({
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
  const [setNeedsRefetch, setNeedsBalanceIn, setNeedsPosRefetch] = useTradeStore(
    (state) => [
      state.setNeedsRefetch,
      state.setNeedsBalanceIn,
      state.setNeedsPosRefetch,
    ]
  );

  const [errorDisplay, setErrorDisplay] = useState(false);
  const [successDisplay, setSuccessDisplay] = useState(false);

  const { config } = usePrepareContractWrite({
    address: poolAddress,
    abi: limitPoolABI,
    functionName: "burnLimit",
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
        closeModal();
      }, 2000);
      if (burnPercent.eq(ethers.utils.parseUnits("1", 38))) {
        setNeedsRefetch(true);
      }
      setNeedsBalanceIn(true);
      setNeedsPosRefetch(true);
      setIsOpen(false);
    },
    onError() {
      setErrorDisplay(true);
    },
  });

  return (
    <>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-7 text-red-600 bg-red-900/30 p-1 rounded-full cursor-pointer -mr-5"
            onClick={() => {
                address ? write?.() : null;
            }}
        >
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
        <div className="fixed bottom-4 right-4 flex flex-col space-y-2">
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