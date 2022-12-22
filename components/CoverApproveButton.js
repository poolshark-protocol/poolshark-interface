import React, { useContext, useState } from 'react';
import { ethers } from "ethers";
import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction
} from 'wagmi';
import { erc20ABI } from 'wagmi';

const tokenOneAddress = "0xC0baf261c12Fc4a75660F6022948341672Faf95F"

export default function CoverApproveButton() {

    const { config } = usePrepareContractWrite({
        address: tokenOneAddress,
        abi: erc20ABI,
        functionName: "approve",
        args:["0xd635c93eC40EE626EB48254eACeF419cCA682917", ethers.utils.parseUnits("1000")],
        chainId: 5,
    })
    
    const { data, isLoading, isSuccess, write } = useContractWrite(config)

    return (
        <div className=" w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
               onClick={() => write?.()}
              >
                Approve
        </div>
    );
}