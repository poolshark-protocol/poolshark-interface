import { ZERO_ADDRESS } from './math/constants'
import { TickMath } from './math/tickMath'
import {
  fetchCoverPools,
  fetchRangePools,
  getCoverPoolFromFactory,
  getRangePoolFromFactory,
} from './queries'
import { token } from './types'

export const getRangePool = async (
  tokenIn: token,
  tokenOut: token,
  setRangeRoute,
  setRangeTickSpacing?,
  setTokenIn?,
  setTokenOut?
) => {
  try {
    const tokenOrder = tokenIn.address.localeCompare(tokenOut.address) < 0
    const pool = await getRangePoolFromFactory(
      tokenIn.address,
      tokenOut.address,
    )
    let id = ZERO_ADDRESS
    const dataLength = pool['data']['rangePools'].length
    if (dataLength != 0) {
      id = pool['data']['rangePools']['0']['id']

      if (setRangeTickSpacing) {
        const tickSpacing = pool['data']['rangePools']['0']['feeTier']['tickSpacing']
        setRangeTickSpacing(tickSpacing)
      }
      if (setTokenIn) {
        const tokenInUsdPrice = tokenOrder ? pool['data']['rangePools']['0']['token0']['usdPrice']
                                           : pool['data']['rangePools']['0']['token1']['usdPrice']
        setTokenIn({
          symbol: tokenIn.symbol,
          logoURI: tokenIn.logoURI,
          address: tokenIn.address,
          value: tokenIn.value,
          usdPrice: !isNaN(parseFloat(tokenInUsdPrice)) ? tokenInUsdPrice : 0
        } as token)
        console.log('token in usd price:', tokenInUsdPrice)
      }
      if (setTokenOut) {
        const tokenOutUsdPrice = tokenOrder ? pool['data']['rangePools']['0']['token1']['usdPrice']
                                            : pool['data']['rangePools']['0']['token0']['usdPrice']
        setTokenOut({
          symbol: tokenOut.symbol,
          logoURI: tokenOut.logoURI,
          address: tokenOut.address,
          value: tokenOut.value,
          usdPrice: !isNaN(parseFloat(tokenOutUsdPrice)) ? tokenOutUsdPrice : 0
        } as token)
        console.log('token out usd price:', tokenOutUsdPrice)
      }
    } else {
      const fallbackPool = await getRangePoolFromFactory(
        tokenOut.address,
        tokenIn.address,
      )
      id = fallbackPool['data']['rangePools']['0']['id']

      if (setRangeTickSpacing) {
        const tickSpacing = fallbackPool['data']['rangePools']['0']['feeTier']['tickSpacing']
        setRangeTickSpacing(tickSpacing)
      }
    }
    setRangeRoute(id)
  } catch (error) {
    console.log(error)
  }
}

export const getCoverPool = async (
  tokenIn: token,
  tokenOut: token,
  setCoverRoute,
) => {
  try {
    const pool = await getCoverPoolFromFactory(
      tokenIn.address,
      tokenOut.address,
    )
    let id = ZERO_ADDRESS
    let dataLength = pool['data']['coverPools'].length
    if (dataLength != 0) {
      id = pool['data']['coverPools']['0']['id']
    } else {
      const fallbackPool = await getCoverPoolFromFactory(
        tokenOut.address,
        tokenIn.address,
      )
      id = fallbackPool['data']['coverPools']['0']['id']
    }
    setCoverRoute(id)
  } catch (error) {
    console.log(error)
  }
}

export const getCoverPoolInfo = async (
  tokenOrder: boolean,
  tokenIn: token,
  tokenOut: token,
  setCoverPoolRoute,
  setCoverPrice,
  setTickSpacing,
) => {
  try {
    console.log('tokenIn', tokenIn.address.toLocaleLowerCase(), 'tokenOut', tokenOut.address.toLocaleLowerCase())
    const pool = await getCoverPoolFromFactory(tokenIn.address, tokenOut.address)
    const dataLength = pool['data']['coverPools'].length
    if (dataLength != 0) {
      setCoverPoolRoute(pool['data']['coverPools']['0']['id'])
      setTickSpacing(
        pool['data']['coverPools']['0']['volatilityTier']['tickSpread'],
      )
      const newLatestTick = pool['data']['coverPools']['0']['latestTick']
      setCoverPrice(TickMath.getPriceStringAtTick(newLatestTick))
    } else {
      setCoverPoolRoute(ZERO_ADDRESS)
      setCoverPrice('1.00')
      setTickSpacing(10)
    }
  } catch (error) {
    console.log(error)
  }
}

export const getFeeTier = async (
  rangePoolRoute: string,
  coverPoolRoute: string,
  setRangeSlippage,
  setCoverSlippage,
) => {
  const coverData = await fetchCoverPools()
  const coverPoolAddress = coverData['data']['coverPools']['0']['id']

  if (coverPoolAddress === coverPoolRoute) {
    const feeTier =
      coverData['data']['coverPools']['0']['volatilityTier']['feeAmount']
    setCoverSlippage((parseFloat(feeTier) / 10000).toString())
  }
  const data = await fetchRangePools()
  const rangePoolAddress = data['data']['rangePools']['0']['id']

  if (rangePoolAddress === rangePoolRoute) {
    const feeTier = data['data']['rangePools']['0']['feeTier']['feeAmount']
    setRangeSlippage((parseFloat(feeTier) / 10000).toString())
  }
}


