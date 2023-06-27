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
import { roundTick } from '../../utils/math/tickMath';
import { BN_ZERO } from '../../utils/math/constants';

export default function CoverAddLiqButton({poolAddress, address, lower, claim, upper, zeroForOne, amount, toAddress, gasLimit}) {

    const [ errorDisplay, setErrorDisplay ] = useState(false);
    const [ successDisplay, setSuccessDisplay ] = useState(false);

    console.log('cover add liq gas limit', gasLimit.toString())
  
    const { config } = usePrepareContractWrite({
      address: poolAddress,
      abi: coverPoolABI,
      functionName: 'mint',
      args: [
        [
          toAddress,
          amount,
          Number(lower),
          Number(upper),
          zeroForOne,
        ],
      ],
      enabled: amount.gt(BN_ZERO) && poolAddress != undefined,
      chainId: 421613,
      overrides: {
        gasLimit: gasLimit,
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
        <div className=" w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
            onClick={() => {
              address ?  write?.() : null
            }}
                >
                Add liquidity
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