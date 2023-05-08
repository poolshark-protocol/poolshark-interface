import { useContractRead } from "wagmi";
import { erc20ABI } from "wagmi";
import { ethers } from "ethers";
import { useState } from "react";
import { rangePoolAddress, tokenZeroAddress } from "../constants/contractAddresses";

export default function useSwapAllowance(address) { 
   const [allowance, setAllowance] = useState(null);
  
    useContractRead({
     address: tokenZeroAddress,
     abi: erc20ABI,
     functionName: "allowance",
     args: [address, rangePoolAddress],
     chainId: 421613,
     watch: true,
     onSuccess(data) {
       //console.log("Success", data);
       //console.log(ethers.utils.formatUnits(data, 18));
       setAllowance(ethers.utils.formatUnits(data, 18))
     },
     onError(error) {
       console.log("Error", error);
     },
     onSettled(data, error) {
       //console.log("Settled", { data, error });
     },
   });
   return allowance;
 }

//This wass the alternative Fucntion on Swap page
/*  const getAllowance = async () => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594',
    )
    const signer = new ethers.VoidSigner(address, provider)
    const contract = new ethers.Contract(tokenIn.address, erc20ABI, signer)
    const allowance = await contract.allowance(address, rangePoolAddress)
    
    //console.log('allowance', allowance)
    setAllowance(allowance)
  } catch (error) {
    console.log(error)
  }
} */

    
