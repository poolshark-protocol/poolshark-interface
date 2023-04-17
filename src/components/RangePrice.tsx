import { useState } from "react";
import { useContractRead } from "wagmi";
import { rangePoolABI } from "../abis/evm/rangePool";
import { rangePoolAddress } from "../constants/contractAddresses";


export default function RangePrice(zeroForOne: boolean) {
    const [price, setPrice] = useState(null);
  
    useContractRead({
        address: rangePoolAddress,
        abi: rangePoolABI,
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