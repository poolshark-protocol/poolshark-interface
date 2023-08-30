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
  import { useSwapStore as useRangeLimitStore } from "../../hooks/useSwapStore"
import { poolsharkRouterABI } from '../../abis/evm/poolsharkRouter';
  
  export default function SwapRouterButton({disabled, routerAddress, amount, zeroForOne, priceLimit, gasLimit}) {
  
    /*const [Limit] = useSwapStore((state: any) => [
      state.Limit
    ]);*/
  
    //TODO: only use allowance for router
    const [
      setNeedsRangeAllowanceIn,
      setNeedsRangeBalanceIn,
    ] = useRangeLimitStore((state) => [
      state.setNeedsRangeAllowanceIn,
      state.setNeedsRangeBalanceIn,
    ]);
  
    const [ errorDisplay, setErrorDisplay ] = useState(false);
    const [ successDisplay, setSuccessDisplay ] = useState(false);
  
    console.log('gas limit swap range', gasLimit.toString())
  
    const { address } = useAccount()
    const userAddress = address;
  
    const { config } = usePrepareContractWrite({
        address: routerAddress,
        abi: poolsharkRouterABI,
        functionName: "multiSwapSplit",
        args:[[
            //poolAddressesArr
            //swapParamsArr
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
        <button className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
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
  