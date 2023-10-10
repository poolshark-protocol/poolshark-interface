import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
} from 'wagmi';
import { limitPoolABI } from "../../abis/evm/limitPool";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState } from "react";
import { BigNumber } from "ethers";
import { useRangeLimitStore } from '../../hooks/useRangeLimitStore';
import { BN_ZERO } from '../../utils/math/constants';

export default function LimitCollectButton({ poolAddress, address, positionId, claim, zeroForOne, gasLimit, gasFee }) {

  const [ errorDisplay, setErrorDisplay ] = useState(false);
  const [ successDisplay, setSuccessDisplay ] = useState(false);

  const [
    setNeedsBalanceIn,
    setNeedsSnapshot,
  ] = useRangeLimitStore((state) => [
    state.setNeedsBalanceIn,
    state.setNeedsSnapshot,
  ])

  const { config } = usePrepareContractWrite({
      address: poolAddress,
      abi: limitPoolABI,
      functionName: "burnLimit",
      args:[[
          address,
          BigNumber.from(0),
          positionId,
          claim,
          zeroForOne
      ]],
      chainId: 421613,
      overrides: {
          gasLimit: gasLimit
      },
  })

  const { data, isSuccess, write } = useContractWrite(config)

  const {isLoading} = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      setSuccessDisplay(true);
      setNeedsBalanceIn(true);
      setNeedsSnapshot(true);
    },
    onError() {
      setErrorDisplay(true);
    },
  });
    
  return (
      <>
      <button className="w-full py-4 mx-auto disabled:cursor-not-allowed cursor-pointer text-center transition rounded-full  border border-main bg-main1 uppercase text-sm disabled:opacity-50 hover:opacity-80"
          disabled={gasFee == '$0.00'}
          onClick={() => {
            address ?  write?.() : null
          }}
              >
              Collect position
      </button>
      <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-50">
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