import { useContractRead } from "wagmi";
import { erc20ABI } from "wagmi";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { coverPoolAddress, tokenOneAddress } from "../constants/contractAddresses";

export default function useAllowance(address) { 
  const [dataState, setDataState] = useState();
  
  const { data, onSuccess } = useContractRead({
    address: tokenOneAddress,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, coverPoolAddress],
    chainId: 5,
    onSuccess(data) {
      console.log("Success", data);
      console.log(ethers.utils.formatUnits(data, 18));
    },
    onError(error) {
      console.log("Error", error);
    },
    onSettled(data, error) {
      console.log("Settled", { data, error });
    },
  }, []);

  useEffect(() => {
    setDataState(data?._hex);
  })
  
  return [dataState];

}



    
