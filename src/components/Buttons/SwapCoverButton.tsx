import { ethers, BigNumber } from "ethers";
import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
    useAccount
} from 'wagmi';
import { coverPoolABI } from "../../abis/evm/coverPool";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import { coverPoolAddress } from "../../constants/contractAddresses";
import React, { useState, useEffect } from "react";
import {useSwapStore} from "../../hooks/useStore"

export default function SwapCoverButton({amount, zeroForOne, baseLimit}) {

  /*const [Limit] = useSwapStore((state: any) => [
    state.Limit
  ]);*/

  const [ errorDisplay, setErrorDisplay ] = useState(false);
  const [ successDisplay, setSuccessDisplay ] = useState(false);

  const { address } = useAccount()
  const userAddress = address;

  const { config } = usePrepareContractWrite({
      address: coverPoolAddress,
      abi: coverPoolABI,
      functionName: "swap",
      args:[
          userAddress,
          zeroForOne,
          amount,
          baseLimit
      ],
      chainId: 421613,
      overrides:{
        gasLimit: BigNumber.from("5000000"),
        //gasPrice: ethers.utils.parseUnits('20', 'gwei')
      }
  })

  const { data, write } = useContractWrite(config)

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
          onClick={() => address ?  write?.() : null}
            >
              Swap
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
