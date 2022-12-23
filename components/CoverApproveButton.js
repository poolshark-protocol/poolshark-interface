import { ethers } from "ethers";
import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
    useAccount,
} from 'wagmi';
import { erc20ABI } from 'wagmi';


export default function CoverApproveButton() {
    const tokenOneAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
const { address } = useAccount();

    const { config } = usePrepareContractWrite({
        address: tokenOneAddress,
        abi: erc20ABI,
        functionName: "approve",
        args:[address, ethers.utils.parseUnits("1000")],
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