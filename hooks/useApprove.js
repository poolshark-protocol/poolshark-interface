import { ethers } from "ethers";
import { poolsharkHedgePoolABI } from "../abis/evm/poolsharkHedgePool";
import useMetamask from './useMetamask';

export default async function useApprove() {
    const { signer, address } = useMetamask()

    const approve = async () => {
        const poolAddress = "0xeB13144982b28D059200DB0b4d1ceDe7d96C4FE7"
        const poolContract = new ethers.Contract(poolAddress, PoolsharkHedgePool.abi, signer)
        await poolContract.connect(signer).approve(address, ethers.utils.parseEther("100"))
    }
    return [approve]
}