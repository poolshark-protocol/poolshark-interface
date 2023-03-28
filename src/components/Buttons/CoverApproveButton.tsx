import {
    useWaitForTransaction,
    usePrepareContractWrite,
    useContractWrite
} from 'wagmi';
import { erc20ABI } from 'wagmi';
import { coverPoolAddress } from "../../constants/contractAddresses";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState } from "react";
import { useStore } from '../../hooks/useStore';

export default function CoverApproveButton({address}) {
  const [ errorDisplay,    setErrorDisplay   ] = useState(false);
  const [ successDisplay,  setSuccessDisplay ] = useState(false);
  const [ configuration,   setConfig         ] = useState();

  const [contractParams, updateAllowance] = useStore((state: any) => [
    state.contractParams, state.updateAllowance
  ]);

  const { config } = usePrepareContractWrite({
    address: address,
    abi: erc20ABI,
    functionName: "approve",
    args:[coverPoolAddress, contractParams.amount],
    chainId: 421613,
  })

  const { data, isSuccess, write } = useContractWrite(config)

  const {isLoading} = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      updateAllowance(contractParams.amount)
      setSuccessDisplay(true);
     
    },
    onError() {
      setErrorDisplay(true);
    },
  });

  return (
    <>
      <div
        className="w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
        onClick={(address) => address ?  write?.() : null}
      >
        Approve
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