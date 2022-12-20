
import React, { useState } from 'react';
import { ethers } from "ethers";

export default async function useMetamask() {

    //const [signer, setSigner] = useState();
    //const [isConnected, setIsConnected] = useState(false);
    //const [address, setAddress] = useState();

    const metamask = async () => {
        if (typeof window.ethereum !== "undefined") {
         try {
            await ethereum.request({ method: "eth_requestAccounts" });
            setIsConnected(true)
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner()
            setSigner(signer)
            wallet.on('input', input => {
            console.log('listening for new inputs: ', input)
            })
            const address = await wallet.address()
            setAddress(address)
        } catch (e) {
        console.log(e)
        }
        } else {
        }
     return [metamask, provider, signer, address]
    }
}