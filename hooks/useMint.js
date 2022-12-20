import { ethers } from "ethers";
//import ERC20 from "../evm_abis/ERC20.json";
import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
} from 'wagmi';

const useMint = () =>  {
    const mint = () => {
        const { config } = usePrepareContractWrite({
            address: "0xbCcb45492338E57cb016F6B69Af122D4A5bb6d8A",
            abi: ["function mint(MintParams memory _mintParams) public lock returns (uint256 _liquidityMinted)"],
            functionName: "mint",
            args:[{
              lowerOld: ethers.utils.parseUnits("0", 0),
              lower: ethers.utils.parseUnits("20", 0),
              upperOld: ethers.utils.parseUnits("887272", 0),
              upper: ethers.utils.parseUnits("30", 0),
              amountDesired: ethers.utils.parseUnits("100"),
              zeroForOne: false,
              native: false}],
            chainId: 5,
            overrides:{
              gasPrice:10000000000
            },
          })
          
        const { data, isLoading, isSuccess, write } = useContractWrite(config)
        console.log(config)
    }
    return [mint];
}
export default useMint;