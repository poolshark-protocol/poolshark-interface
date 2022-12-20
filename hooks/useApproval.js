import { ethers } from "ethers";
import ERC20 from "../evm_abis/ERC20.json";
import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
} from 'wagmi';

const useApproval = () =>  {
    const approval = () => {
        const { approveconfig } = usePrepareContractWrite({
            address: "0xB99e23dcD47930d6ba7eCaDF8299A1F6b920b6F4",
            abi: ERC20,
            functionName: "approve",
            args:["0x1DcF623EDf118E4B21b4C5Dc263bb735E170F9B8", ethers.utils.parseUnits("100")],
            chainId: 5,
        })
        const { data, isLoading, isSuccess, write } = useContractWrite(approveconfig)
        console.log(approveconfig)
    }
    return [approval];
}
export default useApproval;
