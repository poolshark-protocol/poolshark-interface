import { BigNumber, ethers } from "ethers";
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
import { limitPoolABI } from "../../abis/evm/limitPool";
import { useTradeStore } from "../../hooks/useTradeStore";
import { getClaimTick } from "../../utils/maps";
import { gasEstimateBurnLimit } from "../../utils/gas";
import { BN_ZERO } from "../../utils/math/constants";
import { useConfigStore } from "../../hooks/useConfigStore";
import { parseUnits } from "../../utils/math/valueMath";
import { useRouter } from "next/router";

export default function LimitSwapBurnButton({
  poolAddress,
  address,
  positionId,
  epochLast,
  zeroForOne,
  lower,
  upper,
  burnPercent,
}) {
  const { data: signer } = useSigner();

  const [chainId, networkName, limitSubgraph] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
    state.limitSubgraph,
  ]);

  const router = useRouter();

  const [
    setNeedsRefetch,
    setNeedsBalanceIn,
    setNeedsBalanceOut,
    setNeedsSnapshot,
  ] = useTradeStore((state) => [
    state.setNeedsRefetch,
    state.setNeedsBalanceIn,
    state.setNeedsBalanceOut,
    state.setNeedsSnapshot,
  ]);
  const [claimTick, setClaimTick] = useState(0);
  const [gasFee, setGasFee] = useState("$0.00");
  const [gasLimit, setGasLimit] = useState(BN_ZERO);

  const updateClaimTick = async () => {
    console.log(Number(epochLast), "epochLast");

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

  const getGasLimit = async () => {
    await gasEstimateBurnLimit(
      poolAddress,
      address,
      burnPercent,
      positionId,
      BigNumber.from(claimTick),
      zeroForOne,
      signer,
      setGasFee,
      setGasLimit
    );
  };

  useEffect(() => {
    if (poolAddress && positionId && address && signer) {
      updateClaimTick();
    }
  }, []);

  useEffect(() => {
    if (claimTick > 0 && signer) {
      getGasLimit();
    }
  }, [claimTick, signer]);

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
        claim: BigNumber.from(claimTick),
        zeroForOne: zeroForOne,
        sync: true,
      },
    ],
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
      setNeedsSnapshot(true);
      setNeedsBalanceIn(true);
      setNeedsBalanceOut(true);
      setNeedsRefetch(true);
      if (burnPercent.eq(parseUnits("1", 38))) {
        router.push("/");
      }
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
        className="w-7 text-red-600 bg-red-900/30 p-1 rounded-full cursor-pointer "
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
