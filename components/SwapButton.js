import { ethers } from "ethers";
import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
    useAccount,
    useBalance
} from 'wagmi';
import { poolsharkHedgePoolABI } from "../contracts/evm/poolsharkHedgePoolAbi";

const GOERLI_CONTRACT_ADDRESS = '0x87B4784C1a8125dfB9Fb16F8A997128f346f5B13'
const token1Address = "0xa9bAd443855B62E21BeF630afCdBa59a58680997"

export default function SwapButton() {

    const { address, isConnecting, isDisconnecting } = useAccount()

    const userAddress = address;
  
    const balance = useBalance({
      address: token1Address,
      chainId: 5,
    })

    const { config } = usePrepareContractWrite({
        address: GOERLI_CONTRACT_ADDRESS,
        abi: poolsharkHedgePoolABI,
        functionName: "swap",
        args:[
            userAddress,
            false,
            ethers.utils.parseUnits("100", 18),
            ethers.utils.parseUnits("30", 0),
        ],
        chainId: 5,
        overrides:{
          gasLimit: 140000
        },
    })

    const { data, isLoading, isSuccess, write } = useContractWrite(config)
    console.log(config)

    return (
      <>
        <div className=" w-full py-4 mx-auto font-medium text-center transition rounded-xl cursor-pointer bg-gradient-to-r from-[#344DBF] to-[#3098FF] hover:opacity-80"
            onClick={() => address ?  write?.() : null}
              >
                Swap
        </div>
      </>
    );
}