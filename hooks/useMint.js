import React, { useContext, useState } from 'react';
import { ethers } from "ethers";
import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction
} from 'wagmi';
import { poolsharkHedgePoolABI } from "../abis/evm/poolsharkHedgePool";

const GOERLI_CONTRACT_ADDRESS = '0xd635c93eC40EE626EB48254eACeF419cCA682917'

export default function useMint() {
  console.log('useMint')
  const { config } = usePrepareContractWrite({
    address: GOERLI_CONTRACT_ADDRESS,
    abi: poolsharkHedgePoolABI,
    functionName: "mint",
    args:[
      ethers.utils.parseUnits("0", 0),
      ethers.utils.parseUnits("20", 0),
      ethers.utils.parseUnits("887272", 0),
      ethers.utils.parseUnits("30", 0),
      ethers.utils.parseUnits("100"),
      false,
      false
    ],
    chainId: 5,
    overrides:{
      gasLimit: 1000000
    },
  })

  const { data, isLoading, isSuccess, write } = useContractWrite(config)
  console.log(config)
    
  return [write]
}