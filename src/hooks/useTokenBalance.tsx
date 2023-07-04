import { useEffect, useState } from 'react'
import { useBalance, useAccount, useProvider } from "wagmi"
import { tokenOneAddress } from "../constants/contractAddresses"

export default function useTokenBalance(tokenAddress:string) {

    const { address } = useAccount()
    const [tokenBalanceInfo, setTokenBalanceInfo] = useState( {} as any)
    const [queryToken, setQueryToken] = useState(tokenOneAddress as any)

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
        chainId: 421613,
        watch: true,
        
        onSuccess(data){
            setTokenBalanceInfo(data)
        }
    }, )

   const tokenBalanceBox = () => {
        return (
            <div className="md:text-xs text-[10px] whitespace-nowrap text-[#4C4C4C]">
                Balance: {Number(tokenBalanceInfo?.formatted).toFixed(3)} 
            </div>
        )
    }

    return [tokenBalanceInfo, tokenBalanceBox]
}