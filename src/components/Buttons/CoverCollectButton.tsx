import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { coverPoolABI } from "../../abis/evm/coverPool";
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
  snapshotAmount,
}) {
  const [chainId] = useConfigStore((state) => [state.chainId]);
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [successDisplay, setSuccessDisplay] = useState(false);

  const [setNeedsBalance, setNeedsRefetch, setNeedsPosRefetch] = useCoverStore(
    (state) => [
      state.setNeedsBalance,
      state.setNeedsRefetch,
      state.setNeedsPosRefetch,
    ]
  );
  const [gasLimit, setGasLimit] = useState(BN_ZERO);

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
    enabled: positionId != undefined,
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
      setNeedsRefetch(true);
      setNeedsPosRefetch(true);
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
        {gasLimit.lte(BN_ZERO) && snapshotAmount.gt(BN_ZERO) ? (
          <Loader />
        ) : snapshotAmount.gt(BN_ZERO) ? (
          "Collect position"
        ) : (
          "Nothing to collect"
        )}
      </button>
    </>
  );
}
