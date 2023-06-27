import { BigNumber, ethers } from 'ethers';
import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
} from 'wagmi';
import { coverPoolABI } from "../../abis/evm/coverPool";
import { coverPoolAddress } from "../../constants/contractAddresses";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState } from "react";
import { rangePoolABI } from '../../abis/evm/rangePool';

export default function RangeAddLiqButton({poolAddress, address, lower, upper, amount0, amount1, disabled, gasLimit}) {

    const [ errorDisplay, setErrorDisplay ] = useState(false);
    const [ successDisplay, setSuccessDisplay ] = useState(false);

    const burnPercent = ethers.utils.parseUnits("5", 34)
  
    const { config } = usePrepareContractWrite({
      address: poolAddress,
      abi: rangePoolABI,
      functionName: 'mint',
      args: [[
        address,
        lower,
        upper,
        amount0,
        amount1
      ]],
      chainId: 421613,
      overrides: {
        gasLimit: gasLimit,
      },
      onSuccess() {
        console.log('params check', address,
        lower.toString(),
        upper.toString(),
        amount0.toString(),
        amount1.toString())
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
        <button disabled={disabled} className=" w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
            onClick={() => {
              address ?  write?.() : null
            }}
                >
                Add liquidity
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