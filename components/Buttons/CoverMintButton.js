import { ethers } from "ethers";
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { poolsharkHedgePoolABI } from "../../abis/evm/poolsharkHedgePool";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import React, { useState, useEffect } from "react";

const GOERLI_CONTRACT_ADDRESS = "0x87B4784C1a8125dfB9Fb16F8A997128f346f5B13";

export default function CoverMintButton({amount}) {

  const [ errorDisplay, setErrorDisplay ] = useState(false);
  const [ successDisplay, setSuccessDisplay ] = useState(false);


  const { config } = usePrepareContractWrite({
    address: GOERLI_CONTRACT_ADDRESS,
    abi: poolsharkHedgePoolABI,
    functionName: "mint",
    args: [
      ethers.utils.parseUnits("0", 0),
      ethers.utils.parseUnits("20", 0),
      ethers.utils.parseUnits("887272", 0),
      ethers.utils.parseUnits("30", 0),
      amount,
      false,
      false,
    ],
    chainId: 5,
    overrides: {
      gasLimit: 350000,
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
      <div
        className=" w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
        onClick={() => write?.()}
      >
        Create Cover
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
