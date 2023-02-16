import { ethers } from "ethers";
import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
    useAccount,
    useProvider,
    useBalance
} from 'wagmi';
import { coverPoolABI } from "../../abis/evm/coverPool";
import { SuccessToast } from "../Toasts/Success";
import { ErrorToast } from "../Toasts/Error";
import { ConfirmingToast } from "../Toasts/Confirming";
import { coverPoolAddress } from "../../constants/contractAddresses";
import React, { useState } from "react";
import { chainIdsToNamesForGitTokenList } from '../../utils/chains'

export default function SwapButton({amount}) {

  const [ errorDisplay, setErrorDisplay ] = useState(false);
  const [ successDisplay, setSuccessDisplay ] = useState(false);

  const { address } = useAccount()
  const { isConnected } = useAccount();
  const userAddress = address;
  
  const {
    network: { chainId }, chainId: chainIdFromProvider
  } = useProvider();

  const chainName = chainIdsToNamesForGitTokenList[chainId]

  //if(isConnected && chainName === "goerli"){
    const { config } = usePrepareContractWrite({
        address: coverPoolAddress,
        abi: coverPoolABI,
        functionName: "swap",
        args:[
            userAddress,
            false,
            amount,
            ethers.utils.parseUnits("30", 18),
        ],
        chainId: 5,
        overrides:{
          gasLimit: 140000
        },
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
  //}
}