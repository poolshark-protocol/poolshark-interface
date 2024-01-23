import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
} from 'wagmi';
import { rangePoolABI } from "../../abis/evm/rangePool";
import React, { useState } from "react";
import { BN_ONE, BN_ZERO, ZERO_ADDRESS } from '../../utils/math/constants';
import { useConfigStore } from '../../hooks/useConfigStore';
import { rangeStakerABI } from '../../abis/evm/rangeStaker';
import { chainProperties } from '../../utils/chains';

export default function RangeCompoundButton({ poolAddress, address, positionId, staked }) {

  const [ errorDisplay, setErrorDisplay ] = useState(false);
  const [ successDisplay, setSuccessDisplay ] = useState(false);

  const [
    chainId,
    networkName
  ] = useConfigStore((state) => [
    state.chainId,
    state.networkName
  ]);

  const { config: burnConfig } = usePrepareContractWrite({
    address: poolAddress,
    abi: rangePoolABI,
    functionName: "burnRange",
    enabled: positionId != undefined && staked != undefined && !staked,
    args:[[
        address,
        positionId,
        BN_ZERO
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
      burnPercent: BN_ZERO
    }
  ],
  chainId: chainId,
  enabled: poolAddress != ZERO_ADDRESS && staked != undefined && staked,
  onError(err) {
      console.log('compound stake errored')
  },
});

const { data: burnData, write: burnWrite } = useContractWrite(burnConfig)
const { data: burnStakeData, write: burnStakeWrite } = useContractWrite(burnStakeConfig)

const data = !staked ? burnData : burnStakeData
const write = !staked ? burnWrite : burnStakeWrite

  const {isLoading} = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      setSuccessDisplay(true);
    },
    onError() {
      setErrorDisplay(true);
    },
  });
    
  return (
      <>
      <button className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
          onClick={() => {
            address ?  write?.() : null
          }}
          disabled={false}
              >
              Compound position
      </button>
      </>
  );
}