import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
} from 'wagmi';
import { coverPoolABI } from "../../abis/evm/coverPool";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState } from "react";
import { BigNumber, ethers } from "ethers";

export default function CoverCollectButton({ poolAddress, address, lower, claim, upper, zeroForOne, gasLimit, gasFee }) {

  const [ errorDisplay, setErrorDisplay ] = useState(false);
  const [ successDisplay, setSuccessDisplay ] = useState(false);

  const { config } = usePrepareContractWrite({
      address: poolAddress,
      abi: coverPoolABI,
      functionName: "burn",
      args:[[
          address,
          BigNumber.from(0),
          lower,
          claim,
          upper,
          zeroForOne,
          true
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
    },
    onError() {
      setErrorDisplay(true);
    },
  });
    
  return (
      <>
      <button className=" w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
          disabled={gasFee == '$0.00'}
          onClick={() => {
            address ?  write?.() : null
          }}
              >
              Collect position
      </button>
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