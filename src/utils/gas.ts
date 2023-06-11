import { BigNumber, Contract, Signer, ethers } from 'ethers'
import { rangePoolABI } from '../abis/evm/rangePool'
import { coverPoolABI } from '../abis/evm/coverPool'
import { token } from './types'
import { TickMath, roundTick } from './math/tickMath'
import { fetchPrice } from './queries'
import JSBI from 'jsbi'

export const gasEstimateSwap = async (
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
  signer: Signer
) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594',
    )
    if (!coverPoolRoute || !provider) {
      return
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
    const formattedPrice: string =
      '~' +
      networkFeeUsd.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    return formattedPrice
  } catch (error) {
    console.log('gas error', error)
  }
}

export const gasEstimateSwapLimit = async (
  rangePoolRoute: string,
  address: string,
  rangePrice: number,
  rangeBnPrice: BigNumber,
  rangeBnBaseLimit: BigNumber,
  token0: token,
  token1: token,
  bnInput: BigNumber,
  tickSpacing: any,
  signer
) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594',
    )
    if (!rangePoolRoute || !provider) {
      return '0'
    }
    const contract = new ethers.Contract(rangePoolRoute, rangePoolABI, provider)

    const recipient = address
    const zeroForOne = token0.address.localeCompare(token1.address) < 0

    const lower = BigNumber.from(
      roundTick(
        TickMath.getTickAtPriceString(
          (ethers.utils.formatUnits(rangeBnPrice, 18))), tickSpacing).toString()
      )
    
    const upper = zeroForOne ?
    BigNumber.from(
      roundTick(
        TickMath.getTickAtPriceString(
          (ethers.utils.formatUnits(rangeBnPrice.add(rangeBnBaseLimit), 18))), tickSpacing).toString()) :
    BigNumber.from(
      roundTick(
        TickMath.getTickAtPriceString(
          (ethers.utils.formatUnits(rangeBnPrice.sub(rangeBnBaseLimit), 18))), tickSpacing).toString())
    
    const amount1 = ethers.utils.parseEther(
      (parseFloat(ethers.utils.formatUnits(bnInput, 18)) *
        rangePrice).toString()
      )

    let gasUnits: BigNumber
    gasUnits = await contract
      .connect(signer)
      .estimateGas.mint([recipient, lower, upper, bnInput, amount1])
    const price = await fetchPrice('0x000')
    const gasPrice = await provider.getGasPrice()
    const ethUsdPrice = Number(price['data']['bundles']['0']['ethPriceUSD'])
    const networkFeeWei = gasPrice.mul(gasUnits)
    const networkFeeEth = Number(ethers.utils.formatUnits(networkFeeWei, 18))
    const networkFeeUsd = networkFeeEth * ethUsdPrice
    const formattedPrice: string =
      networkFeeUsd.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    
    return formattedPrice
  }
  catch (error) {
    console.log('gas error', error)
    return 'Increase Allowance'
  }
}

export const gasEstimateCoverMint = async (
  coverPoolRoute: string,
  address: string,
  upperTick: number,
  lowerTick: number,
  tokenIn: token,
  tokenOut: token,
  inAmount: JSBI,
  tickSpacing: any,
  signer
) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594',
    )
    if (!coverPoolRoute || !provider || !signer) {
      return Number(0).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    }
    const contract = new ethers.Contract(coverPoolRoute, coverPoolABI, provider)

    const recipient = address
    const zeroForOne = tokenIn.address.localeCompare(tokenOut.address) < 0

    const lower = BigNumber.from(lowerTick)
    const upper = BigNumber.from(upperTick)
    const claim = zeroForOne ? upper : lower
    const amountIn = BigNumber.from(String(inAmount))

    const gasUnits: BigNumber = await contract
      .connect(signer)
      .estimateGas.mint([recipient, amountIn, lower, claim, upper, zeroForOne])
    const price = await fetchPrice('0x000')
    const gasPrice = await provider.getGasPrice()
    const ethUsdPrice = Number(price['data']['bundles']['0']['ethPriceUSD'])
    const networkFeeWei = gasPrice.mul(gasUnits)
    const networkFeeEth = Number(ethers.utils.formatUnits(networkFeeWei, 18))
    const networkFeeUsd = networkFeeEth * ethUsdPrice
    const formattedPrice: string =
      networkFeeUsd.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    
    return formattedPrice
  }
  catch (error) {
    console.log('gas error', error)
    return 'Increase Allowance'
  }
}

