import { ZERO_ADDRESS } from './math/constants'
import { getCoverPoolFromFactory, getRangePoolFromFactory } from './queries'
import { token } from './types'

export const getRangePool = async (
  tokenIn: token,
  tokenOut: token,
  setRangeRoute,
  setRangeTickSpacing?,
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
      
      if (setRangeTickSpacing) {
        setRangeTickSpacing(pool['data']['rangePools']['0']['feeTier']['tickSpacing'])
      }
    } else {
      const fallbackPool = await getRangePoolFromFactory(
        tokenOut.address,
        tokenIn.address,
      )
      id = fallbackPool['data']['rangePools']['0']['id']

      if (setRangeTickSpacing) {
        setRangeTickSpacing(pool['data']['rangePools']['0']['feeTier']['tickSpacing'])
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
