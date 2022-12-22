import React, { useContext, useState } from 'react';
import { ethers } from "ethers";
import { BigNumber } from 'ethers';
import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
    useAccount
} from 'wagmi';
import { poolsharkHedgePoolABI } from "../abis/evm/poolsharkHedgePool";

const GOERLI_CONTRACT_ADDRESS = '0xd635c93eC40EE626EB48254eACeF419cCA682917'

export default function CoverBurnButton() {
    console.log('useBurn')
    const { address, isConnecting, isDisconnecting } = useAccount()

    const { config } = usePrepareContractWrite({
        address: GOERLI_CONTRACT_ADDRESS,
        abi: poolsharkHedgePoolABI,
        functionName: "burn",
        args:[
            ethers.utils.parseUnits("20", 0),
            ethers.utils.parseUnits("30", 0),
            ethers.utils.parseUnits("20", 0),
            false,
            BigNumber.from("199760153929825488153727")
        ],
        chainId: 5,
        overrides:{
            gasLimit: 350000
        },
        })

    const { data, isLoading, isSuccess, write } = useContractWrite(config)
    console.log(config)
    
    return (
        <>
        <div className=" w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
            onClick={() => address ?  write?.() : null}
                >
                Burn position
        </div>
        </>
    );
}