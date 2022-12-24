import { ethers } from "ethers";
import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction
} from 'wagmi';
import { erc20ABI } from 'wagmi';

const tokenOneAddress = "0xa9bAd443855B62E21BeF630afCdBa59a58680997"
const GOERLI_CONTRACT_ADDRESS = '0x87B4784C1a8125dfB9Fb16F8A997128f346f5B13'

export default function CoverApproveButton() {

    const { config } = usePrepareContractWrite({
        address: tokenOneAddress,
        abi: erc20ABI,
        functionName: "approve",
        args:[GOERLI_CONTRACT_ADDRESS, ethers.utils.parseUnits("10", 18)],
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