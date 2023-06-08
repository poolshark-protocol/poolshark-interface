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
) => {
  try {
    const pool = await getRangePoolFromFactory(
      tokenIn.address,
      tokenOut.address,
    )
    let id = ZERO_ADDRESS
    let dataLength = pool['data']['rangePools'].length
    if (dataLength != 0) {
      id = pool['data']['rangePools']['0']['id']
    } else {
      const fallbackPool = await getRangePoolFromFactory(
        tokenOut.address,
        tokenIn.address,
      )
      id = fallbackPool['data']['rangePools']['0']['id']
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


