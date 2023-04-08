import { useContractRead, useProvider, useAccount } from "wagmi";
import { erc20ABI } from "wagmi";
import { ethers } from "ethers";
import { useState } from "react";
import { coverPoolAddress, tokenZeroAddress } from "../constants/contractAddresses";
import { rangeTokenZero as tokenZero } from "../abis/evm/rangeTokenZero";

export default function useCoverAllowance(address) { 
   const [allowance, setAllowance] = useState(null);
  
    useContractRead({
     address: tokenZeroAddress,
     abi: erc20ABI,
     functionName: "allowance",
     args: [address, coverPoolAddress],
     chainId: 421613,
     watch: true,
     onSuccess(data) {
       console.log("Success", data);
       console.log(ethers.utils.formatUnits(data, 18));
       setAllowance(ethers.utils.formatUnits(data, 18))
     },
     onError(error) {
       console.log("Error", error);
     },
     onSettled(data, error) {
       console.log("Settled", { data, error });
     },
   });
   return allowance;
 }


    
