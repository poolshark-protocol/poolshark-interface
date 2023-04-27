import { useContractRead } from 'wagmi'
import { erc20ABI } from 'wagmi'
import { ethers } from 'ethers'
import { useState } from 'react'
import {
  rangePoolAddress,
  tokenZeroAddress,
} from '../constants/contractAddresses'

export default async function useRangeAllowance(userAddress, tokenAddress) {
  const [allowance, setAllowance] = useState(null)

  try {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594',
    )
    const signer = new ethers.VoidSigner(userAddress, provider)
    const contract = new ethers.Contract(rangePoolAddress, erc20ABI, signer)
    const allowance = await contract.allowance(userAddress, rangePoolAddress)
    
    //console.log('allowance', allowance)
    setAllowance(allowance)
  } catch (error) {
    console.log(error)
  }
  return allowance
}

//This wass the alternative Fucntion on Swap page
/*  const getAllowance = async () => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594',
    )
    const signer = new ethers.VoidSigner(address, provider)
    const contract = new ethers.Contract(tokenIn.address, erc20ABI, signer)
    const allowance = await contract.allowance(address, rangePoolAddress)
    
    //console.log('allowance', allowance)
    setAllowance(allowance)
  } catch (error) {
    console.log(error)
  }
} */
