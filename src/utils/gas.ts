import { BigNumber, Contract, Signer, ethers } from 'ethers'
import { rangePoolABI } from '../abis/evm/rangePool'
import { coverPoolABI } from '../abis/evm/coverPool'
import { token } from './types'
import { TickMath, roundTick } from './math/tickMath'
import { fetchPrice } from './queries'
import JSBI from 'jsbi'
import { BN_ZERO } from './math/constants'

export interface gasEstimateResult {
  formattedPrice: string
  gasUnits: BigNumber
}

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
  allowanceRange: BigNumber,
  allowanceCover: BigNumber,
  ethUsdPrice: number,
  address: string,
  signer: Signer,
  isConnected: boolean
): Promise<gasEstimateResult> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594',
    )
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
    if (rangePoolRoute && coverPoolRoute && isConnected) {
      if (rangeQuote > coverQuote) {
        const contract = new ethers.Contract(rangePoolRoute, rangePoolABI, provider)
        gasUnits = await contract
        .connect(signer)
        .estimateGas.swap([
          recipient,
          recipient,
          priceLimit,
          bnInput.lte(allowanceRange) ? bnInput : allowanceRange,
          zeroForOne
        ])
      }
      else {
        const contract = new ethers.Contract(coverPoolRoute, coverPoolABI, provider)
        gasUnits = await contract
        .connect(signer)
        .estimateGas.swap([
          recipient,
          recipient,
          priceLimit,
          bnInput.lte(allowanceCover) ? bnInput : allowanceCover,
          zeroForOne
        ])
      }
    } else {
      gasUnits = BigNumber.from(1000000)
    }
    const gasPrice = await provider.getGasPrice()
    const networkFeeWei = gasPrice.mul(gasUnits)
    const networkFeeEth = Number(ethers.utils.formatUnits(networkFeeWei, 18))
    const networkFeeUsd = networkFeeEth * ethUsdPrice
    const formattedPrice: string =
      networkFeeUsd.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    return { formattedPrice, gasUnits }
  } catch (error) {
    console.log('gas error', error)
    return { formattedPrice: '$0.00', gasUnits: BN_ZERO }
  }
}

export const gasEstimateSwapLimit = async (
  rangePoolRoute: string,
  address: string,
  lowerTick: BigNumber,
  upperTick: BigNumber,
  token0: token,
  token1: token,
  bnInput: BigNumber,
  tickSpacing: any,
  signer
): Promise<gasEstimateResult> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594',
    )
    if (!rangePoolRoute || !provider) {
      return { formattedPrice: '$0.00', gasUnits: BN_ZERO }
    }
    const contract = new ethers.Contract(rangePoolRoute, rangePoolABI, provider)

    const recipient = address
    const zeroForOne = token0.address.localeCompare(token1.address) < 0

    let gasUnits: BigNumber
    gasUnits = BN_ZERO
    await contract
      .connect(signer)
      .estimateGas.mint([
        recipient,
        lowerTick,
        upperTick,
        zeroForOne ? bnInput : BN_ZERO,
        zeroForOne ? BN_ZERO : bnInput
    ])
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
    
    return { formattedPrice, gasUnits }
  }
  catch (error) {
    console.log('gas error', error)
    return { formattedPrice: '$0.00', gasUnits: BN_ZERO }
  }
}

export const gasEstimateRangeMint = async (
  rangePoolRoute: string,
  address: string,
  lowerTick: BigNumber,
  upperTick: BigNumber,
  amount0: BigNumber,
  amount1: BigNumber,
  signer
): Promise<gasEstimateResult> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594',
    )
    if (!rangePoolRoute || !provider) {
      return { formattedPrice: '$0.00', gasUnits: BN_ZERO }
    }
    const contract = new ethers.Contract(rangePoolRoute, rangePoolABI, provider)

    const recipient = address

    const gasUnits = await contract
      .connect(signer)
      .estimateGas.mint([
        recipient,
        lowerTick,
        upperTick,
        amount0,
        amount1
    ])
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
      console.log('mint gas estimate', lowerTick.toString(), upperTick.toString(), gasUnits.toString())
    return { formattedPrice, gasUnits }
  }
  catch (error) {
    console.log('gas error', error)
    return { formattedPrice: '$0.00', gasUnits: BN_ZERO }
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
): Promise<gasEstimateResult> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594',
    )
    if (!coverPoolRoute || !provider || !signer) {
      return { formattedPrice: '$0.00', gasUnits: BN_ZERO }
    }
    const contract = new ethers.Contract(coverPoolRoute, coverPoolABI, provider)

    const recipient = address
    const zeroForOne = tokenIn.address.localeCompare(tokenOut.address) < 0

    const lower = BigNumber.from(lowerTick)
    const upper = BigNumber.from(upperTick)
    const amountIn = BigNumber.from(String(inAmount))
    const gasUnits: BigNumber = await contract
      .connect(signer)
      .estimateGas.mint([recipient, amountIn, lower, upper, zeroForOne])
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
    
    return { formattedPrice, gasUnits }
  }
  catch (error) {
    console.log('gas error', error)
    return { formattedPrice: '$0.00', gasUnits: BN_ZERO }
  }
}

