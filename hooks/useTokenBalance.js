import { useState, useEffect } from 'react'
import { useBalance, useAccount } from "wagmi"

export default function useTokenBalance() {

    const { address, isConnected } = useAccount()
    const [tokenBalanceInfo, setTokenBalanceInfo] = useState()

    const userAddress = address

    const { data } = useBalance({
        address: userAddress,
        token: "0xa9bAd443855B62E21BeF630afCdBa59a58680997",
        chainid: 5,
    })
    
    useEffect(() => {
        console.log('balance updated')
        setTokenBalanceInfo(data)
    },[isConnected])

   const tokenBalanceBox = () => {
        return (
            <div className="text-xs text-[#4C4C4C]">
                Balance: {tokenBalanceInfo?.formatted} {tokenBalanceInfo?.symbol}
            </div>
        )
    }

    return [tokenBalanceInfo, tokenBalanceBox]
}