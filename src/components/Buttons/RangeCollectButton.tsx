import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
} from 'wagmi';
import { rangePoolABI } from "../../abis/evm/rangePool";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState } from "react";
import { BN_ONE } from '../../utils/math/constants';
import { useRangeLimitStore } from '../../hooks/useRangeLimitStore';
import { useConfigStore } from '../../hooks/useConfigStore';
import { rangeStakerABI } from '../../abis/evm/rangeStaker';
import { chainProperties } from '../../utils/chains';

export default function RangeCollectButton({ poolAddress, address, positionId, staked }) {

  const [ errorDisplay, setErrorDisplay ] = useState(false);
  const [ successDisplay, setSuccessDisplay ] = useState(false);

  const [
    chainId,
    networkName
  ] = useConfigStore((state) => [
    state.chainId,
    state.networkName
  ]);

  const [
    setNeedsBalanceIn,
    setNeedsBalanceOut
  ] = useRangeLimitStore((state) => [
    state.setNeedsBalanceIn,
    state.setNeedsBalanceOut
  ]);

  const { config: burnConfig } = usePrepareContractWrite({
      address: poolAddress,
      abi: rangePoolABI,
      functionName: "burnRange",
      enabled: positionId != undefined && !staked,
      args:[[
          address,
          positionId,
          BN_ONE
        ]],
      chainId: chainId,
      onError(err) {
        console.log('compound error')
      },
  });

  const { config: burnStakeConfig } = usePrepareContractWrite({
    address: chainProperties[networkName]["rangeStakerAddress"],
    abi: rangeStakerABI,
    functionName: "burnRangeStake",
    args: [
      poolAddress,
      {
        to: address,
        positionId: positionId,
        burnPercent: BN_ONE
      }
    ],
    chainId: chainId,
    enabled: positionId != undefined && staked,
    onError(err) {
        console.log('burn errored')
    },
  });

  const { data: burnData, write: burnWrite } = useContractWrite(burnConfig)
  const { data: burnStakeData, write: burnStakeWrite } = useContractWrite(burnConfig)

  const data = !staked ? burnData : burnStakeData
  const write = !staked ? burnWrite : burnStakeWrite

  const {isLoading} = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      setSuccessDisplay(true);
      setNeedsBalanceIn(true);
      setNeedsBalanceOut(true);
    },
    onError() {
      setErrorDisplay(true);
    },
  });
    
  return (
      <>
      <div className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-grey2 bg-grey3/30 uppercase text-sm disabled:opacity-50 hover:opacity-80"
          onClick={() => {
            address ?  write?.() : null
          }}
              >
              Collect position
      </div>
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