import { BigNumber, Contract, ethers } from 'ethers'
import { rangePoolABI } from '../abis/evm/rangePool'
import { coverPoolABI } from '../abis/evm/coverPool'
import { token } from './types'
import { TickMath } from './math/tickMath'
import { fetchPrice } from './queries'
import { useSigner } from 'wagmi'

export const gasEstimate = async (
  rangePoolRoute: string,
  coverPoolRoute: string,
  rangeQuote: number,
  coverQuote: number,
  rangeBnPrice: BigNumber,
  rangeBnBaseLimit: BigNumber,
  tokenIn: token,
  tokenOut: token,
  bnInput: BigNumber,
  address: string,
  signer,
) => {
  try {
    //const { data: signer } = useSigner()
    const provider = new ethers.providers.JsonRpcProvider(
      'https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594',
    )
    if (!coverPoolRoute || !provider) {
      return '0'
    }
    var contract: Contract
    if (rangeQuote > coverQuote) {
      contract = new ethers.Contract(rangePoolRoute, rangePoolABI, provider)
    } else {
      contract = new ethers.Contract(coverPoolRoute, coverPoolABI, provider)
    }

    const recipient = address
    const zeroForOne = tokenIn.address.localeCompare(tokenOut.address) < 0

    const priceLimit =
      tokenOut.address != '' &&
      tokenIn.address.localeCompare(tokenOut.address) < 0
        ? BigNumber.from(
            TickMath.getSqrtPriceAtPriceString(
              rangeBnPrice.sub(rangeBnBaseLimit).toString(),
              18,
            ).toString(),
          )
        : BigNumber.from(
            TickMath.getSqrtPriceAtPriceString(
              rangeBnPrice.add(rangeBnBaseLimit).toString(),
              18,
            ).toString(),
          )
    let gasUnits: BigNumber
    if (rangeQuote > coverQuote)
      gasUnits = await contract
        .connect(signer)
        .estimateGas.swap(recipient, recipient, zeroForOne, bnInput, priceLimit)
    else
      gasUnits = await contract
        .connect(signer)
        .estimateGas.swap(recipient, zeroForOne, bnInput, priceLimit)
    const price = await fetchPrice('0x000')
    const gasPrice = await provider.getGasPrice()
    const ethUsdPrice = Number(price['data']['bundles']['0']['ethPriceUSD'])
    const networkFeeWei = gasPrice.mul(gasUnits)
    const networkFeeEth = Number(ethers.utils.formatUnits(networkFeeWei, 18))
    const networkFeeUsd = networkFeeEth * ethUsdPrice
    //console.log('fee price:', networkFeeUsd)
    const formattedPrice: string =
      '~' +
      networkFeeUsd.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })

    //setGasFee(formattedPrice)
    return formattedPrice
  } catch (error) {
    console.log('gas error', error)
    return 'Increase Allowance'
  }
}


