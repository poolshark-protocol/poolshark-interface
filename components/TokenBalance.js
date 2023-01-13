// import { data } from 'autoprefixer'
import { useState, useEffect } from 'react'
import { useBalance, useAccount } from "wagmi"

export default function TokenBalance() {

    const { address, isConnected } = useAccount()
    const [info, setInfo] = useState()

    const userAddress = address
    //Warning: Text content did not match. Server: "undefined undefined" Client: "0.0 TOKEN20A"
    //An error occurred during hydration. The server HTML was replaced with client content in <div>.
    //Hydration failed because the initial UI does not match what was rendered on the server.
    //Uncaught Error: There was an error while hydrating. Because the error happened outside of a Suspense boundary, the entire root will switch to client rendering.

    //Warning: Prop `className` did not match. Server: "null" Client: " w-full py-4 mx-auto font-medium text-center
    const data = useBalance({
        address: userAddress,
        token: "0xa9bAd443855B62E21BeF630afCdBa59a58680997",
        chainid: 5,
    })
    
    useEffect(() => {
        setInfo(data)
    },[])

    return (
        <div className="text-xs text-[#4C4C4C]">
            Balance: {data?.formatted} {data?.symbol}
        </div>
    )

}