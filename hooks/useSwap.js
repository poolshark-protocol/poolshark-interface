import React, { useContext, useState } from 'react';
import { ethers } from "ethers";
import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
    useAccount,
    useBalance
} from 'wagmi';
import { poolsharkHedgePoolABI } from "../abis/evm/poolsharkHedgePool";

const GOERLI_CONTRACT_ADDRESS = '0xd635c93eC40EE626EB48254eACeF419cCA682917'
const token1Address = "0xC0baf261c12Fc4a75660F6022948341672Faf95F"

export default function useSwap() {
  console.log('useSwap')
  const { address, isConnecting, isDisconnecting } = useAccount()

  const balance = useBalance({
    address: token1Address,
    chainId: 5,
  })

  if (!address) {
    return null
  }
  else {
    const { config } = usePrepareContractWrite({
        address: GOERLI_CONTRACT_ADDRESS,
        abi: poolsharkHedgePoolABI,
        functionName: "swap",
        args:[
            address,
            false,
            balance,
            ethers.utils.parseUnits("30", 0),
        ],
        chainId: 5,
        overrides:{
        gasLimit: 1000000
        },
    })
    }

  const { data, isLoading, isSuccess, write } = useContractWrite(config)
  console.log(config)
    
  return [write]
}