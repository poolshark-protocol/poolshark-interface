import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
} from 'wagmi';
import { rangePoolABI } from "../../abis/evm/rangePool";
import React, { useState, useEffect } from "react";
import { BN_ONE, ZERO_ADDRESS } from '../../utils/math/constants';
import { useRangeLimitStore } from '../../hooks/useRangeLimitStore';
import { useConfigStore } from '../../hooks/useConfigStore';
import { rangeStakerABI } from '../../abis/evm/rangeStaker';
import { chainProperties } from '../../utils/chains';
import { getRangeStakerAddress } from '../../utils/config';
import { toast } from "sonner";

export default function RangeCollectButton({ poolAddress, address, positionId, staked }) {

  const [toastId, setToastId] = useState(null);

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
      enabled: positionId != undefined && staked != undefined && !staked,
      args:[[
          address,
          positionId,
          BN_ONE
        ]],
      chainId: chainId,
      onError(err) {
        console.log('collect error')
      },
  });

  const { config: burnStakeConfig } = usePrepareContractWrite({
    address: getRangeStakerAddress(networkName),
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
    enabled: poolAddress != ZERO_ADDRESS && staked != undefined && staked,
    onError(err) {
        console.log('collect stake error')
    },
  });

  const { data: burnData, write: burnWrite } = useContractWrite(burnConfig)
  const { data: burnStakeData, write: burnStakeWrite } = useContractWrite(burnStakeConfig)

  const data = !staked ? burnData : burnStakeData
  const write = !staked ? burnWrite : burnStakeWrite

  const {isLoading} = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      toast.success("Your transaction was successful",{
        id: toastId,
        action: {
          label: "View",
          onClick: () => window.open(`${chainProperties[networkName]["explorerUrl"]}/tx/${data?.hash}`, '_blank'),
        },
      });
      setNeedsBalanceIn(true);
      setNeedsBalanceOut(true);
    },
    onError() {
      toast.error("Your transaction failed",{
        id: toastId,
        action: {
          label: "View",
          onClick: () => window.open(`${chainProperties[networkName]["explorerUrl"]}/tx/${data?.hash}`, '_blank'),
        },
      });
    },
  });

  useEffect(() => {
    if(isLoading) {
      const newToastId = toast.loading("Your transaction is being confirmed...",{
        action: {
          label: "View",
          onClick: () => window.open(`${chainProperties[networkName]["explorerUrl"]}/tx/${data?.hash}`, '_blank'),
        },
      });
      newToastId
      setToastId(newToastId);
    }
  }, [isLoading]);
    
  return (
      <>
      <div className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-grey2 bg-grey3/30 uppercase text-sm disabled:opacity-50 hover:opacity-80"
          onClick={() => {
            address ?  write?.() : null
          }}
              >
              Collect position
      </div>
      </>
  );
}