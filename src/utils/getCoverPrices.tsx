import { useContractRead } from "wagmi";
import { BigNumber, ethers } from "ethers";
import { coverPoolAddress } from "../constants/contractAddresses";
import { coverPoolABI } from '../abis/evm/coverPool'
import { useState } from "react";

export function getCoverQuoteWagmi(
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

export function getCoverPriceWagmi(zeroForOne: boolean) {
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