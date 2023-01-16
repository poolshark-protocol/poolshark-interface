import { useState, useEffect } from 'react'
import { useBalance, useAccount } from "wagmi"
import { tokenOneAddress } from '../constants/contractAddresses'

export default function useTokenBalance() {

    const { address, isConnected } = useAccount()
    const [tokenBalanceInfo, setTokenBalanceInfo] = useState()

    const userAddress = address

    const { data } = useBalance({
        address: userAddress,
        token: tokenOneAddress,
        chainid: 5,
    })
    
    useEffect(() => {
        console.log('balance updated')
        setTokenBalanceInfo(data)
    })

   const tokenBalanceBox = () => {
        return (
            <div className="text-xs text-[#4C4C4C]">
                Balance: {tokenBalanceInfo?.formatted} {tokenBalanceInfo?.symbol}
            </div>
        )
    }

    return [tokenBalanceInfo, tokenBalanceBox]
}