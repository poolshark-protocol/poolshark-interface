// import { useContractRead, useProvider, useAccount } from "wagmi";
// import { erc20ABI } from "wagmi";
// import { ethers } from "ethers";
// import { useState } from "react";
// import { coverPoolAddress, tokenOneAddress } from "../constants/contractAddresses";

// export default function useAllowance(address: `0x${string}`) { 
//   const [allowance, setAllowance] = useState(null);
  
//    const fetch = () => {
//     useContractRead({
//     address: tokenOneAddress,
//     abi: erc20ABI,
//     functionName: "allowance",
//     args: [address, coverPoolAddress],
//     chainId: 421613,
//     watch: true,
//     onSuccess(data) {
//       console.log("Success", data);
//       console.log(ethers.utils.formatUnits(data, 18));
//       setAllowance(ethers.utils.formatUnits(data, 18))
//     },
//     onError(error) {
//       console.log("Error", error);
//     },
//     onSettled(data, error) {
//       console.log("Settled", { data, error });
//     },
//   });
  
//   return allowance;
// }
// fetch()
// }

    
