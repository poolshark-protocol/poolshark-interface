import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useSigner,
} from "wagmi";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useEffect, useState } from "react";
import { rangePoolABI } from "../../abis/evm/rangePool";
import { BN_ZERO } from "../../utils/math/constants";
import { gasEstimateRangeMint } from "../../utils/gas";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { BigNumber } from "ethers";

export default function RangeAddLiqButton({
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
    setNeedsAllowanceIn,
    setNeedsAllowanceOut,
    setNeedsBalanceIn,
    setNeedsBalanceOut,
    setNeedsRefetch,
  ] = useRangeLimitStore((state) => [
    state.setNeedsAllowanceIn,
    state.setNeedsAllowanceOut,
    state.setNeedsBalanceIn,
    state.setNeedsBalanceOut,
    state.setNeedsRefetch,
  ]);
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [successDisplay, setSuccessDisplay] = useState(false);
  const [fetchDelay, setFetchDelay] = useState(false);

  const { data: signer } = useSigner();

  const { config } = usePrepareContractWrite({
    address: poolAddress,
    abi: rangePoolABI,
    functionName: "mintRange",
    args: [
      {
        to: address,
        lower: lower,
        upper: upper,
        positionId: positionId,
        amount0: amount0,
        amount1: amount1,
      },
    ],
    //args: [[address, lower, positionId, upper, amount0, amount1]],
    chainId: 421613,
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
      setNeedsRefetch(true);
      if (amount1.gt(BigNumber.from(0))) {
        setNeedsAllowanceOut(true);
        setNeedsBalanceOut(true);
      }
      setIsOpen(false);
    },
    onError() {
      setErrorDisplay(true);
    },
  });

  return (
    <>
      <button
        disabled={gasLimit.lte(BN_ZERO) || disabled}
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => {
          address ? write?.() : null;
        }}
      >
        Add liquidity
      </button>
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
