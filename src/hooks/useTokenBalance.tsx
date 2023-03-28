import { useEffect, useState } from 'react'
import { useBalance, useAccount, useProvider } from "wagmi"
import { coverTokenOne } from "../constants/contractAddresses"
import { chainIdsToNamesForGitTokenList } from '../utils/chains'

export default function useTokenBalance(tokenAddress) {

    const { address, isConnected } = useAccount()
    const [tokenBalanceInfo, setTokenBalanceInfo] = useState({} as any)
    const [queryToken, setQueryToken] = useState(coverTokenOne as any)

    const userAddress = address

    const tokenBalanceSetting = () => {
      setQueryToken(tokenAddress)
    }

    useEffect(() => {
      tokenBalanceSetting()
    }, [tokenAddress])
      
    const { data } = useBalance({
        address: userAddress,
        token: queryToken,
        chainId: 5,
        watch: true,
        
        onSuccess(data){
            setTokenBalanceInfo(data)
        }
    }, )

   const tokenBalanceBox = () => {
        return (
            <div className="text-xs text-[#4C4C4C]">
                Balance: {Number(tokenBalanceInfo?.formatted).toFixed(3)} 
            </div>
        )
    }

    return [tokenBalanceInfo, tokenBalanceBox]
}