import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { coverPoolABI } from "../../abis/evm/coverPool";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import Loader from "../Icons/Loader";
import { useCoverStore } from "../../hooks/useCoverStore";
import { useConfigStore } from "../../hooks/useConfigStore";
import { gasEstimateCoverBurn } from "../../utils/gas";
import { BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";

export default function CoverCollectButton({
  poolAddress,
  address,
  positionId,
  claim,
  zeroForOne,
  gasFee,
  signer,
  snapshotAmount
}) {
  const [
    chainId
  ] = useConfigStore((state) => [
    state.chainId,
  ]);
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [successDisplay, setSuccessDisplay] = useState(false);

  const [setNeedsBalance] = useCoverStore((state) => [state.setNeedsBalance]);
  const [gasLimit, setGasLimit] = useState(BN_ZERO);

  console.log('snapshot amount', snapshotAmount.toString(), snapshotAmount.gt(BN_ZERO))

  useEffect(() => {
    if (
      snapshotAmount?.gt(BN_ZERO) &&
      poolAddress &&
      poolAddress != ZERO_ADDRESS &&
      positionId &&
      claim &&
      signer
    ) {
      updateGasFee();
    }
  }, [poolAddress, positionId, claim, signer]);

  async function updateGasFee() {
    const newBurnGasFee = await gasEstimateCoverBurn(
      poolAddress,
      address,
      positionId,
      BN_ZERO,
      claim,
      zeroForOne,
      signer
    );
    setGasLimit(newBurnGasFee.gasUnits.mul(250).div(100));
  }

  const { config } = usePrepareContractWrite({
    address: poolAddress,
    abi: coverPoolABI,
    functionName: "burn",
    args: [[address, BigNumber.from(0), positionId, claim, zeroForOne, true]],
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
      setNeedsBalance(true);
    },
    onError() {
      setErrorDisplay(true);
    },
  });

  return (
    <>
      <button
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full flex items-center justify-center border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        disabled={gasLimit.lte(BN_ZERO) || snapshotAmount == 0}
        onClick={() => {
          address ? write?.() : null;
        }}
      >
        {gasLimit.lte(BN_ZERO) && snapshotAmount.gt(BN_ZERO) ? <Loader /> : "Collect position"}
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
