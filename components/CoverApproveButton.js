import { ethers } from "ethers";
import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction
} from 'wagmi';
import { erc20ABI } from 'wagmi';

const tokenOneAddress = "0xC0baf261c12Fc4a75660F6022948341672Faf95F"
const GOERLI_CONTRACT_ADDRESS = '0xd635c93eC40EE626EB48254eACeF419cCA682917'

export default function CoverApproveButton() {

    const { config } = usePrepareContractWrite({
        address: tokenOneAddress,
        abi: erc20ABI,
        functionName: "approve",
        args:[GOERLI_CONTRACT_ADDRESS, ethers.utils.parseUnits("10", 18)],
        chainId: 5,
    })

    const { data, isLoading, isSuccess, write } = useContractWrite(config)
    console.log(config)
    
    return (
        <div className=" w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
               onClick={() => write?.()}
              >
                Approve
        </div>
    );
}