import React, { useContext, useState } from 'react';
import { ethers } from "ethers";
//import ERC20 from "../evm_abis/ERC20.json";
import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
} from 'wagmi';
import PoolsharkHedgePool from "../evm_abis/PoolsharkHedgePool.json";


const useMint = () => {
    const { config } = usePrepareContractWrite({
        address: "0xeB13144982b28D059200DB0b4d1ceDe7d96C4FE7",
        abi: PoolsharkHedgePool,
        functionName: "mint",
        args:[ethers.utils.parseUnits("0", 0),
          ethers.utils.parseUnits("20", 0),
          ethers.utils.parseUnits("887272", 0),
          ethers.utils.parseUnits("30", 0),
          ethers.utils.parseUnits("100"),
          false,
          false],
        chainId: 5,
        overrides:{
          gasLimit:1000000000000000
        },
      })
      
    const { data, isLoading, isSuccess, write } = useContractWrite(config)
    console.log(config)
    
    return [write]
}
export default useMint;