import { BigNumber } from "ethers";
import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
    useAccount
} from 'wagmi';
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState } from "react";
import { rangePoolABI } from "../../abis/evm/rangePool";
import { useSwapStore as useRangeStore } from "../../hooks/useSwapStore"

export default function SwapRangeButton({disabled, poolAddress, amount, zeroForOne, priceLimit, gasLimit}) {

  /*const [Limit] = useSwapStore((state: any) => [
    state.Limit
  ]);*/

  const [
    setNeedsRangeAllowanceIn,
    setNeedsRangeBalanceIn,
  ] = useRangeStore((state) => [
    state.setNeedsRangeAllowanceIn,
    state.setNeedsRangeBalanceIn,
  ]);

  const [ errorDisplay, setErrorDisplay ] = useState(false);
  const [ successDisplay, setSuccessDisplay ] = useState(false);

  console.log('gas limit swap range', gasLimit.toString())

  const { address } = useAccount()
  const userAddress = address;

  const { config } = usePrepareContractWrite({
      address: poolAddress,
      abi: rangePoolABI,
      functionName: "swap",
      args:[[
          userAddress,
          userAddress,
          priceLimit,
          amount,
          zeroForOne
      ]],
      chainId: 421613,
      overrides:{
        gasLimit: gasLimit,
      }
  })

  const { data, write } = useContractWrite(config)

  const {isLoading} = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      setSuccessDisplay(true);
      setNeedsRangeAllowanceIn(true);
      setNeedsRangeBalanceIn(true);
    },
    onError() {
      setErrorDisplay(true);
    },
  });
  
  return (
    <>
      <button className={
          disabled
            ? 'w-full py-4 text-sm md:text-base mx-auto font-medium text-center transition rounded-xl cursor-not-allowed bg-gradient-to-r from-[#344DBF] to-[#3098FF] opacity-50'
            : 'w-full py-4 text-sm md:text-base mx-auto text-center transition font-medium rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80'
        }
          disabled={disabled} 
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
