import { ethers } from "ethers";
import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
    useAccount,
    useBalance
} from 'wagmi';
import { poolsharkHedgePoolABI } from "../../abis/evm/poolsharkHedgePool";
const GOERLI_CONTRACT_ADDRESS = '0xd635c93eC40EE626EB48254eACeF419cCA682917'
const token1Address = "0xC0baf261c12Fc4a75660F6022948341672Faf95F"

export default function SwapButton({amount}) {

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
            //ethers.utils.parseUnits("100", 18),
            amount,
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