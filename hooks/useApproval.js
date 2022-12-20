import React, { useContext, useState} from 'react';
import { ethers } from "ethers";
import { erc20ABI } from 'wagmi'
import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
} from 'wagmi';

const useApproval = () =>{
    const { config } = usePrepareContractWrite({
        address: "0x73Ff5b4FE522C986EE11baD682dfAbCaBDccAb43",
        abi: ERC20,
        functionName: "approve",
        args:["0x1DcF623EDf118E4B21b4C5Dc263bb735E170F9B8", ethers.utils.parseUnits("1000")],
        chainId: 5,
        overrides:{
            gasLimit:1000000000000000
        },
    })
    const { data, isLoading, isSuccess, write } = useContractWrite(config)
    console.log(config)

    return [write]
    
}
export default useApproval;
