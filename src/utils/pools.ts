import { ZERO_ADDRESS } from './math/constants'
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
    console.log(feeTier, 'fee cover')
    setCoverSlippage((parseFloat(feeTier) / 10000).toString())
  }
  const data = await fetchRangePools()
  const rangePoolAddress = data['data']['rangePools']['0']['id']

  if (rangePoolAddress === rangePoolRoute) {
    const feeTier = data['data']['rangePools']['0']['feeTier']['feeAmount']
    console.log(feeTier, 'fee range')
    setRangeSlippage((parseFloat(feeTier) / 10000).toString())
  }
}
