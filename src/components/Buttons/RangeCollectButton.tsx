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

export default function RangeCollectButton({ poolAddress, address, positionId, gasLimit }) {

  const [ errorDisplay, setErrorDisplay ] = useState(false);
  const [ successDisplay, setSuccessDisplay ] = useState(false);

  const [
    setNeedsBalanceIn,
    setNeedsBalanceOut
  ] = useRangeLimitStore((state) => [
    state.setNeedsBalanceIn,
    state.setNeedsBalanceOut
  ]);

  const { config } = usePrepareContractWrite({
      address: poolAddress,
      abi: rangePoolABI,
      functionName: "burnRange",
      args:[[
          address,
          positionId,
          BN_ONE
        ]],
      chainId: 421613,
      overrides:{
          gasLimit: gasLimit
      },
  })

  const { data, isSuccess, write } = useContractWrite(config)

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
      <div className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
          onClick={() => {
            address ?  write?.() : null
          }}
              >
              Collect position
      </div>
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