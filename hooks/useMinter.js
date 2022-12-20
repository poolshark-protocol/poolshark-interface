import useMetamask from "./useMetamask";
import { ethers } from "ethers";
import PoolsharkHedgePool from "../abis/evm/poolsharkHedgePool";


export default async function useMinter() {
    const { signer } = useMetamask()
    
    const mint = async () => {
        const poolAddress = "0xeB13144982b28D059200DB0b4d1ceDe7d96C4FE7"
        const poolContract = new ethers.Contract(poolAddress, PoolsharkHedgePool.abi, signer)
        console.log(provider);
        await poolContract.connect(signer).mint(ethers.utils.parseUnits("0", 0),
        ethers.utils.parseUnits("20", 0),
        ethers.utils.parseUnits("887272", 0),
        ethers.utils.parseUnits("30", 0),
        ethers.utils.parseEther("100"),
        false,
        false)
    }
    return [mint]   
}
