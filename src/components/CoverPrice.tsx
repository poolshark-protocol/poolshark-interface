import { useState } from "react";
import { useContractRead } from "wagmi";
import { coverPoolABI } from "../abis/evm/coverPool";
import { coverPoolAddress } from "../constants/contractAddresses";


export default function CoverPrice(zeroForOne: boolean) {
    const [price, setPrice] = useState(null);
  
    useContractRead({
        address: coverPoolAddress,
        abi: coverPoolABI,
        functionName: zeroForOne ? "pool1" : "pool0",
        args: [],
        chainId: 421613,
        watch: true,
        onSuccess(data) {
          console.log("Success", data);
          setPrice(data)
        },
        onError(error) {
          console.log("Error", error);
        },
        onSettled(data, error) {
          console.log("Settled", { data, error });
        },
      });
  
      return price[0];
  }