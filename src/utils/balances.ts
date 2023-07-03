import { Contract, ethers } from 'ethers'
import { erc20ABI } from 'wagmi'
import { token } from './types'

//@dev put balanc
export const getBalances = async (
  address: string,
  hasSelected: boolean,
  tokenIn: token,
  tokenOut: token,
  setBalance0,
  setBalance1,
) => {
  let bal1 = '0'
  let bal2 = '0'
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594',
      421613,
    )
    const signer = new ethers.VoidSigner(address, provider)
    const tokenOutBal = new ethers.Contract(tokenIn.address, erc20ABI, signer)
    const balance1 = await tokenOutBal.balanceOf(address)
    let token2Bal: Contract
    bal1 = Number(ethers.utils.formatEther(balance1)).toFixed(2)
    if (hasSelected === true) {
      token2Bal = new ethers.Contract(tokenOut.address, erc20ABI, signer)
      const balance2 = await token2Bal.balanceOf(address)
      bal2 = Number(ethers.utils.formatEther(balance2)).toFixed(2)

      setBalance1(bal2)
    }

    //return { bal1, bal2 }
    setBalance0(bal1)
  } catch (error) {
    console.log(error)
  }
}
