import React, { useContext, useState } from 'react';
import { ethers } from "ethers";
import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction
} from 'wagmi';
import { poolsharkHedgePoolABI } from "../abis/evm/poolsharkHedgePool";

const GOERLI_CONTRACT_ADDRESS = '0xd635c93eC40EE626EB48254eACeF419cCA682917'


export default function CoverMintButton() {

        const { config } = usePrepareContractWrite({
          address: "0xd635c93eC40EE626EB48254eACeF419cCA682917",
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
            gasLimit: 10000000
          },
        })
        const { data, isLoading, isSuccess, write } = useContractWrite(config)
     


    return (
        <div className=" w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
               onClick={() => write?.()}
              >
                Create Cover
        </div>
    );
}