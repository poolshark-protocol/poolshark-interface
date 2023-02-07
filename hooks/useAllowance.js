import { useContractRead } from "wagmi";
import { erc20ABI } from "wagmi";
import { ethers } from "ethers";
import { useState } from "react";
import { coverPoolAddress, tokenOneAddress } from "../constants/contractAddresses";

export default function useAllowance(address) { 
  const [dataState, setDataState] = useState(null);
  
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



    
