import { ethers, BigNumber } from "ethers";
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { rangePoolABI } from "../../abis/evm/rangePool";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState, useEffect } from "react";
import { coverPoolAddress, rangePoolAddress } from "../../constants/contractAddresses";
import { useRangeStore } from "../../hooks/useStore";

export default function RangeMintButton({disabled}) {

  const [ errorDisplay, setErrorDisplay ] = useState(false);
  const [ successDisplay, setSuccessDisplay ] = useState(false);
  const [ isDisabled, setDisabled ] = useState(disabled);

    useEffect(() => {
      },[disabled])

  const [rangeContractParams] = useRangeStore((state) => [state.rangeContractParams])


    
  const { config } = usePrepareContractWrite({
    address: rangePoolAddress,
    abi: rangePoolABI,
    functionName: "mint",
    args: [
      rangeContractParams.to,
      rangeContractParams.lower,
      rangeContractParams.upper,
      rangeContractParams.amount0,
      rangeContractParams.amount1,
      rangeContractParams.fungible,
    ],
    chainId: 421613,
    overrides: {
      gasLimit: BigNumber.from("350000"),
    },
  });

  const { data, write } = useContractWrite(config);

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
        className={disabled ? "w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-not-allowed bg-gradient-to-r from-[#344DBF] to-[#3098FF] opacity-50": "w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80" }
        onClick={() => coverPoolAddress ?  write?.() : null}
      >
        Mint Range Position
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
