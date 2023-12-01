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
import { gasEstimateRangeStake } from "../../utils/gas";
import { positionERC1155ABI } from "../../abis/evm/positionerc1155";

// unstake position
// add liquidity while staked
// remove liquidity while staked
// compound and collect while staked

export default function RangeStakeButton({
  address,
  rangePoolAddress,
  rangePoolTokenAddress,
  positionId,
  signer,
  stakeApproved
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
  const [stakeGasLimit, setUnstakeGasLimit] = useState(BN_ZERO)

  useEffect(() => {
    if (
      positionId != undefined && rangePoolAddress != ZERO_ADDRESS
    ) {
      updateGasFee();
    }
  }, [positionId, rangePoolAddress, stakeApproved]);

  async function updateGasFee() {
    if (!stakeApproved) return
    const newGasFee = await gasEstimateRangeStake(
      rangePoolAddress,
      address,
      positionId,
      networkName,
      signer
    );
    setUnstakeGasLimit(newGasFee.gasUnits.mul(130).div(100));
  }

  const { config: stakeConfig } = usePrepareContractWrite({
      address: chainProperties[networkName]["rangeStakerAddress"],
      abi: rangeStakerABI,
      functionName: "stakeRange",
      args: [
          {
              to: address,
              pool: rangePoolAddress,
              positionId: positionId,
          }
      ],
      chainId: chainId,
      enabled: positionId != undefined && stakeApproved,
      overrides: {
          gasLimit: stakeGasLimit,
      },
      onSuccess() {},
      onError() {
        console.log('error stake')
      },
  });

  const { data: stakeData, write: stakeWrite } = useContractWrite(stakeConfig);

  const {config: approveConfig} = usePrepareContractWrite({
    address: rangePoolTokenAddress,
    abi: positionERC1155ABI,
    functionName: "setApprovalForAll",
    args: [
        chainProperties[networkName]["rangeStakerAddress"],
        true
    ],
    chainId: chainId,
    enabled: rangePoolTokenAddress != ZERO_ADDRESS && !stakeApproved,
    onSuccess() {},
    onError() {
      console.log('error approve all')
    },
  });

  const { data: approveData, write: approveWrite } = useContractWrite(approveConfig);

  const data = stakeApproved ? stakeData : approveData
  const write = stakeApproved ? stakeWrite : approveWrite

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
        disabled={false}
        className="bg-green-800/20 whitespace-nowrap border w-full border-green-500/50 text-green-500 transition-all py-1.5 px-5 text-sm uppercase cursor-pointer text-[13px]"
        onClick={() => write?.()}
      >
          {stakeApproved ? "Stake Position" : "Approve Stake"}
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