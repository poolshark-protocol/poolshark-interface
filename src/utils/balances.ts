import { Contract, ethers } from 'ethers'
import { erc20ABI } from 'wagmi'
import { token } from './types'

//@dev put balanc
export const getBalances = async (
  address: string,
  hasSelected: boolean,
  tokenIn: token,
  tokenOut: token,
) => {
  let bal1 = '0'
  let bal2 = '0'
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://arb-goerli.g.alchemy.com/v2/M8Dr_KQx46ghJ93XDQe7j778Qa92HRn2',
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

      //setBalance1(bal2)
    }

    return { bal1, bal2 }
    //setBalance0(bal1)
  } catch (error) {
    console.log(error)
  }
}
