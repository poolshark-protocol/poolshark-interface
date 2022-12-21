import React, { useContext, useState} from 'react';
import { ethers } from "ethers";
import { erc20ABI } from 'wagmi'
import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
} from 'wagmi';

const useApproval = (address) => {
    const token1Address = "0xC0baf261c12Fc4a75660F6022948341672Faf95F"
    const { config } = usePrepareContractWrite({
        address: token1Address,
        abi: erc20ABI,
        functionName: "approve",
        args:["0xd635c93eC40EE626EB48254eACeF419cCA682917", ethers.utils.parseUnits("1000")],
        chainId: 5,
        overrides:{
            gasLimit: 10000000
          },
    })
    const { data, isLoading, isSuccess, write } = useContractWrite(config)
    console.log(config)

    return [write]
}
export default useApproval;
