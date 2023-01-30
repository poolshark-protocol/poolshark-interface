import { useState, useEffect } from 'react'
import { useBalance, useAccount } from "wagmi"
import { tokenOneAddress } from '../constants/contractAddresses'

export default function useTokenBalance() {

    const { address, isConnected } = useAccount()
    const [tokenBalanceInfo, setTokenBalanceInfo] = useState(null)

    const userAddress = address

    const { data } = useBalance({
        address: userAddress,
        token: tokenOneAddress,
        chainid: 5,
        watch: true,
        onSuccess(data){
            setTokenBalanceInfo(data)
        }
    }, [tokenBalanceInfo])
    
    /*useEffect(() => {
        console.log('balance updated')
        setTokenBalanceInfo(data)
    })*/

   const tokenBalanceBox = () => {
        return (
            <div className="text-xs text-[#4C4C4C]">
                Balance: 4699.99 {tokenBalanceInfo?.symbol}
            </div>
        )
    }

    return [tokenBalanceInfo, tokenBalanceBox]
}