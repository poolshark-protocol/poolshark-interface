// import { data } from 'autoprefixer'
import { useState, useEffect } from 'react'
import { useBalance, useAccount } from "wagmi"

export default function TokenBalance() {

    const { address, isConnected } = useAccount()
    const [info, setInfo] = useState()

    const userAddress = address

    //TODO: token balance returns empty value

    const data = useBalance({
        address: userAddress,
        token: "0xa9bAd443855B62E21BeF630afCdBa59a58680997",
        chainid: 5,
    })
    
    useEffect(() => {
        console.log('balance updated')
        setInfo(data)
    },[])

    return (
        <div className="text-xs text-[#4C4C4C]">
            Balance: {data?.formatted} {data?.symbol}
        </div>
    )

}