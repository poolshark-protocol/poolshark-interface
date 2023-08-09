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
import { BigNumber } from "ethers";
import { BN_ZERO } from '../../utils/math/constants';
import { useRangeStore } from '../../hooks/useRangeStore';

export default function RangeCollectButton({ poolAddress, address, lower, upper, gasLimit }) {

  const [ errorDisplay, setErrorDisplay ] = useState(false);
  const [ successDisplay, setSuccessDisplay ] = useState(false);

  const [
    setNeedsBalanceIn,
    setNeedsBalanceOut
  ] = useRangeStore((state) => [
    state.setNeedsBalanceIn,
    state.setNeedsBalanceOut
  ]);

  const { config } = usePrepareContractWrite({
      address: poolAddress,
      abi: rangePoolABI,
      functionName: "burn",
      args:[[
          address,
          lower,
          upper,
          BN_ZERO
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
      <div className=" w-full py-4 mx-auto font-medium text-sm md:text-base text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
          onClick={() => {
            address ?  write?.() : null
          }}
              >
              Collect position
      </div>
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
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