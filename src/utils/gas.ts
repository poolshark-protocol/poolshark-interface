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
  address: string,
  signer: Signer,
  isConnected: boolean,
  setGasFee,
  setGasLimit
): Promise<void> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594',
    )
    const ethUsdQuery = await fetchPrice('ethereum')
    const ethUsdPrice = ethUsdQuery['data']['bundles']['0']['ethPriceUSD']

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
    const networkFeeUsd = networkFeeEth * Number(ethUsdPrice)
    const formattedPrice: string =
      networkFeeUsd.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    setGasFee(formattedPrice)
    setGasLimit(gasUnits.mul(150).div(100))
  } catch (error) {
    console.log('gas error', error)
    setGasFee('$0.00')
    setGasLimit(BN_ZERO)
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
  signer,
  setMintGasFee,
  setMintGasLimit
): Promise<void> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594',
    )
    const price = await fetchPrice('ethereum')
    console.log('price sub limit', price)
    const ethUsdPrice = price['data']['bundles']['0']['ethPriceUSD']

    if (!rangePoolRoute || !provider) {
      setMintGasFee('$0.00')
      setMintGasLimit(BN_ZERO)
    }

    const recipient = address
    const zeroForOne = token0.address.localeCompare(token1.address) < 0

    const contract = new ethers.Contract(rangePoolRoute, rangePoolABI, provider)

    let gasUnits: BigNumber
    gasUnits = await contract
      .connect(signer)
      .estimateGas.mint([
        recipient,
        lowerTick,
        upperTick,
        zeroForOne ? bnInput : BN_ZERO,
        zeroForOne ? BN_ZERO : bnInput
    ])
    console.log('limit gas units', gasUnits.toString())
    const gasPrice = await provider.getGasPrice()
    const networkFeeWei = gasPrice.mul(gasUnits)
    const networkFeeEth = Number(ethers.utils.formatUnits(networkFeeWei, 18))
    const networkFeeUsd = networkFeeEth * Number(ethUsdPrice)
    console.log('network fee usd limit', networkFeeUsd)
    const formattedPrice: string =
      networkFeeUsd.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    
    setMintGasFee(formattedPrice)
    setMintGasLimit(gasUnits.mul(150).div(100))
  }
  catch (error) {
    console.log('gas error limit', error)
    setMintGasFee('$0.00')
    setMintGasLimit(BN_ZERO)
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
    if (!rangePoolRoute || !provider || (amount0.eq(BN_ZERO) && amount1.eq(BN_ZERO))) {
      console.log('early return', rangePoolRoute, provider)
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
    console.log('new mint gas limit', gasUnits.toString(), lowerTick.toString(), upperTick.toString())
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
      console.log('gas estimate mint', lowerTick.toString(), upperTick.toString(), gasUnits.toString())
    return { formattedPrice, gasUnits }
  }
  catch (error) {
    console.log('gas error', error)
    return { formattedPrice: '$0.00', gasUnits: BN_ZERO }
  }
}

export const gasEstimateRangeBurn = async (
  rangePoolRoute: string,
  address: string,
  lowerTick: BigNumber,
  upperTick: BigNumber,
  burnPercent: BigNumber,
  signer
): Promise<gasEstimateResult> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594',
    )

    if (!rangePoolRoute || !provider) {
      console.log('early return', rangePoolRoute, provider)
      return { formattedPrice: '$0.00', gasUnits: BN_ZERO }
    }
    const contract = new ethers.Contract(rangePoolRoute, rangePoolABI, provider)
    console.log('burn args', burnPercent.toString(), lowerTick.toString(), upperTick.toString())
    const recipient = address

    const gasUnits = await contract
      .connect(signer)
      .estimateGas.burn([
        recipient,
        lowerTick,
        upperTick,
        burnPercent
    ])
    console.log('burn estimate args', gasUnits.toString(), burnPercent.toString(), lowerTick.toString(), upperTick.toString(), )
    const price = await fetchPrice('ethereum')
    const gasPrice = await provider.getGasPrice()
    const ethUsdPrice = price['data']['bundles']['0']['ethPriceUSD']
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

export const gasEstimateCoverBurn = async (
  coverPoolRoute: string,
  address: string,
  burnPercent: BigNumber,
  lowerTick: BigNumber,
  claimTick: BigNumber,
  upperTick: BigNumber,
  zeroForOne: boolean,
  signer
): Promise<gasEstimateResult> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://nd-646-506-606.p2pify.com/3f07e8105419a04fdd96a890251cb594',
    )

    if (!coverPoolRoute || !provider) {
      return { formattedPrice: '$0.00', gasUnits: BN_ZERO }
    }
    const contract = new ethers.Contract(coverPoolRoute, coverPoolABI, provider)
    console.log('new burn percent check', burnPercent.toString())
    const recipient = address

    const gasUnits = await contract
      .connect(provider)
      .estimateGas.burn([
        recipient,
        burnPercent,
        lowerTick,
        claimTick,
        upperTick,
        zeroForOne,
        true
    ])
    console.log('new burn percent gas limit', gasUnits.toString(), burnPercent.toString(), lowerTick.toString(), upperTick.toString())
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

