import { ethers } from "ethers";
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { coverPoolABI } from "../../abis/evm/coverPool";
import React, { useState } from "react";
import { useCoverStore } from "../../hooks/useCoverStore";
import { BN_ZERO } from "../../utils/math/constants";
import Loader from "../Icons/Loader";
import { useConfigStore } from "../../hooks/useConfigStore";
import { parseUnits } from "../../utils/math/valueMath";

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

  const [chainId, networkName] = useConfigStore((state) => [
    state.chainId,
    state.networkName,
  ]);

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
      setNeedsRefetch(true);
      setNeedsPosRefetch(true);
      setNeedsBalance(true);
      setIsOpen(false);
      closeModal();
    },
    onError() {
      setErrorDisplay(true);
    },
  });

  return (
    <>
      <button
        disabled={disabled || gasLimit.lte(BN_ZERO)}
        className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
        onClick={() => {
          address ? write?.() : null;
        }}
      >
        {gasLimit.lte(BN_ZERO) ? <Loader /> : "Remove Liquidity"}
      </button>
    </>
  );
}
