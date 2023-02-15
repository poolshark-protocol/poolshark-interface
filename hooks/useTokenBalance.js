import { useEffect, useState } from 'react'
import { useBalance, useAccount, useProvider } from "wagmi"
import { tokenOneAddress } from "../constants/contractAddresses"
import { chainIdsToNamesForGitTokenList } from '../utils/chains'

export default function useTokenBalance(tokenAddress) {

    const { address, isConnected } = useAccount()
    const [tokenBalanceInfo, setTokenBalanceInfo] = useState(0)
    const [queryToken, setQueryToken] = useState(tokenOneAddress)

    const userAddress = address

    const {
        network: { chainId }, chainId: chainIdFromProvider
      } = useProvider();
    
    const chainName = chainIdsToNamesForGitTokenList[chainId]

    const tokenBalanceSetting = () => {
      setQueryToken(tokenAddress)
    }

    useEffect(() => {
      tokenBalanceSetting()
    }, [tokenAddress])
      
    const { data } = useBalance({
        address: userAddress,
        token: queryToken,
        chainid: 5,
        watch: true,
        
        onSuccess(data){
            setTokenBalanceInfo(data)
        }
    }, [queryToken])

   const tokenBalanceBox = () => {
        if (isConnected && chainName === "goerli"){
            return (
                <div className="text-xs text-[#4C4C4C]">
                    Balance: {Number(tokenBalanceInfo?.formatted).toFixed(3)} 
                </div>
            )
        }
    }

    return [tokenBalanceInfo, tokenBalanceBox]
}