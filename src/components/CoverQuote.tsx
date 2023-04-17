import { useContractRead } from "wagmi";
import { BigNumber, ethers } from "ethers";
import { coverPoolAddress, rangePoolAddress } from "../constants/contractAddresses";
import { useState } from "react";
import { coverPoolABI } from "../abis/evm/coverPool";

export default function CoverQuote(
    zeroForOne: boolean, 
    amountIn: BigNumber, 
    priceLimit: BigNumber
) {
    const [quote, setQuote] = useState(null);

    useContractRead({
        address: coverPoolAddress,
        abi: coverPoolABI,
        functionName: "quote",
        args: [true, ethers.utils.parseUnits('1', 18), BigNumber.from('4295128739')],
        chainId: 421613,
        watch: true,
        onSuccess(data) {
          console.log("Success", data);
          setQuote(data)
        },
        onError(error) {
          console.log("Error", error);
        },
        onSettled(data, error) {
          console.log("Settled", { data, error });
        },
      });
    
      return quote;  
}
