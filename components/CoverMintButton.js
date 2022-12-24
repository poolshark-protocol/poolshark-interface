import { ethers } from "ethers";
import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction
} from 'wagmi';
import { poolsharkHedgePoolABI } from "../contracts/evm/poolsharkHedgePoolAbi";

const GOERLI_CONTRACT_ADDRESS = '0x87B4784C1a8125dfB9Fb16F8A997128f346f5B13'

export default function CoverMintButton() {

  const { config } = usePrepareContractWrite({
    address: GOERLI_CONTRACT_ADDRESS,
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
      gasLimit: 350000
    },
  })

  const { data, isLoading, isSuccess, write } = useContractWrite(config)
  console.log(config)

  return (
    <div className=" w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
            onClick={() => write?.()}
          >
            Create Cover
    </div>
  );
}