import { useContractRead, useProvider, useAccount } from "wagmi";
import { erc20ABI } from "wagmi";
import { ethers } from "ethers";
import { useState } from "react";
import { coverPoolAddress, tokenOneAddress } from "../constants/contractAddresses";
import { chainIdsToNamesForGitTokenList } from '../utils/chains'

export default function useAllowance(address) { 
  const [dataState, setDataState] = useState(null);
  const { isConnected } = useAccount();

  const {
    network: { chainId }, chainId: chainIdFromProvider
  } = useProvider();

  const chainName = chainIdsToNamesForGitTokenList[chainId]
  
    const { data, onSuccess } = useContractRead({
      address: tokenOneAddress,
      abi: erc20ABI,
      functionName: "allowance",
      args: [address, coverPoolAddress],
      chainId: 5,
      watch: true,
      onSuccess(data) {
        console.log("Success", data);
        console.log(ethers.utils.formatUnits(data, 18));
        setDataState(data?._hex)
      },
      onError(error) {
        console.log("Error", error);
      },
      onSettled(data, error) {
        console.log("Settled", { data, error });
      },
    }, [dataState]);


  return [dataState];
}



    
