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

export default function CoverRemoveLiqButton({disabled, poolAddress, address, lower, claim, upper, zeroForOne, burnPercent, gasLimit}) {

    const [ errorDisplay, setErrorDisplay ] = useState(false);
    const [ successDisplay, setSuccessDisplay ] = useState(false);

    console.log('cover burn percent:', ethers.utils.formatUnits(burnPercent, 38))
  
    const { config } = usePrepareContractWrite({
        address: poolAddress,
        abi: coverPoolABI,
        functionName: "burn",
        args:[[
            address,
            burnPercent,
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
        <button 
          disabled={disabled}
          className={
          disabled
            ? 'w-full py-4 mx-auto font-medium text-center text-sm md:text-base transition rounded-xl cursor-not-allowed bg-gradient-to-r from-[#344DBF] to-[#3098FF] opacity-50'
            : 'w-full py-4 mx-auto text-center font-medium text-sm md:text-base transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80'
        }
            onClick={() => {
              address ?  write?.() : null
            }}
                >
                Remove liquidity
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