import {
    useContractWrite,
    usePrepareContractWrite,
    useWaitForTransaction,
  } from "wagmi";
import React, { useEffect, useState } from "react";
import { useConfigStore } from "../../hooks/useConfigStore";
import { chainProperties } from "../../utils/chains";
import { rangeStakerABI } from "../../abis/evm/rangeStaker";
import { BN_ZERO, ZERO_ADDRESS } from "../../utils/math/constants";
import { useRangeLimitStore } from "../../hooks/useRangeLimitStore";
import { ConfirmingToast } from "../Toasts/Confirming";
import { ErrorToast } from "../Toasts/Error";
import { SuccessToast } from "../Toasts/Success";
import { gasEstimateRangeUnstake } from "../../utils/gas";
import { getRangeStakerAddress } from "../../utils/config";
  
  // unstake position
  // add liquidity while staked
  // remove liquidity while staked
  // compound and collect while staked

export default function RangeUnstakeButton({
    address,
    rangePoolAddress,
    positionId,
    signer,
}) {

const [
    chainId,
    networkName
    ] = useConfigStore((state) => [
    state.chainId,
    state.networkName
    ]);

    const [
      setNeedsAllowanceIn,
      setNeedsAllowanceOut,
      setNeedsBalanceIn,
      setNeedsBalanceOut,
      setNeedsRefetch,
      setNeedsPosRefetch,
    ] = useRangeLimitStore((state) => [
      state.setNeedsAllowanceIn,
      state.setNeedsAllowanceOut,
      state.setNeedsBalanceIn,
      state.setNeedsBalanceOut,
      state.setNeedsRefetch,
      state.setNeedsPosRefetch,
    ]);

    const [errorDisplay, setErrorDisplay] = useState(false);
    const [successDisplay, setSuccessDisplay] = useState(false);
    const [unstakeGasLimit, setUnstakeGasLimit] = useState(BN_ZERO)

    useEffect(() => {
      if (
        positionId != undefined && rangePoolAddress != ZERO_ADDRESS
      ) {
        updateGasFee();
      }
    }, [positionId, rangePoolAddress, signer]);

    async function updateGasFee() {
      const newGasFee = await gasEstimateRangeUnstake(
        rangePoolAddress,
        address,
        positionId,
        networkName,
        signer
      );
      setUnstakeGasLimit(newGasFee.gasUnits.mul(130).div(100));
    }

    const { config } = usePrepareContractWrite({
        address: getRangeStakerAddress(networkName),
        abi: rangeStakerABI,
        functionName: "unstakeRange",
        args: [
            {
                to: address,
                pool: rangePoolAddress,
                positionId: positionId,
            }
        ],
        chainId: chainId,
        enabled: rangePoolAddress != undefined,
        overrides: {
            gasLimit: unstakeGasLimit,
        },
        onSuccess() {},
        onError() {
          console.log('error unstaked', rangePoolAddress, positionId)
        },
    });

    const { data, write } = useContractWrite(config);

    const { isLoading } = useWaitForTransaction({
        hash: data?.hash,
        onSuccess() {
          setSuccessDisplay(true);
          setNeedsAllowanceIn(true);
          setNeedsBalanceIn(true);
          setTimeout(() => {
            setNeedsRefetch(true);
            setNeedsPosRefetch(true);
          }, 2500);
        },
        onError() {
          setErrorDisplay(true);
          setNeedsRefetch(false);
          setNeedsPosRefetch(false);
        },
    });

    return (
        <>
        <button
          disabled={unstakeGasLimit?.lte(BN_ZERO)}
          className="bg-red-800/20 whitespace-nowrap border w-full border-red-500/50 text-red-500 transition-all py-1.5 px-5 text-sm uppercase cursor-pointer text-[13px]"
          onClick={() => write?.()}
        >
            Unstake Position
        </button>
        <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-50">
          {
            errorDisplay && (
              <ErrorToast
                  hash={data?.hash}
                  errorDisplay={errorDisplay}
                  setErrorDisplay={setErrorDisplay}
              />
            )
          }
          {isLoading ? <ConfirmingToast hash={data?.hash} /> : <></>}
          {
            successDisplay && (
              <SuccessToast
                  hash={data?.hash}
                  successDisplay={successDisplay}
                  setSuccessDisplay={setSuccessDisplay}
              />
            )
          }
      </div>
        </>
    );
}
  