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
  setTokenOut?,
  setEthUsdPrice?
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
        const tickSpacing =
          pool['data']['rangePools']['0']['feeTier']['tickSpacing']
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
      if (setEthUsdPrice) {
        const pricesLength = pool['data']['basePrices'].length
        if (pricesLength != 0){
          const ethUsdPrice = pool['data']['basePrices']['0']['USD']
          setEthUsdPrice(parseFloat(ethUsdPrice))
        }
      }
    } else {
      const fallbackPool = await getRangePoolFromFactory(
        tokenOut.address,
        tokenIn.address,
      )
      id = fallbackPool['data']['rangePools']['0']['id']

      if (setRangeTickSpacing) {
        const tickSpacing =
          fallbackPool['data']['rangePools']['0']['feeTier']['tickSpacing']
        setRangeTickSpacing(tickSpacing)
      }
    }
    setRangeRoute(id)
    console.log('range route', id)
  } catch (error) {
    console.log(error)
  }
}

export const getCoverPool = async (
  tokenIn: token,
  tokenOut: token,
  setCoverRoute,
  setTokenInUsdPrice?
) => {
  try {
    const tokenOrder = tokenIn.address.localeCompare(tokenOut.address) < 0
    const pool = await getCoverPoolFromFactory(
      tokenIn.address,
      tokenOut.address,
    )
    //let id = ZERO_ADDRESS
    const dataLength = pool['data']['coverPools'].length
    if (dataLength != 0) {
      setCoverRoute(pool['data']['coverPools']['0']['id'])
      if (setTokenInUsdPrice) {
        setTokenInUsdPrice(tokenOrder ? pool['data']['coverPools']['0']['token0']['usdPrice']
                                      : pool['data']['coverPools']['0']['token1']['usdPrice'])
      }
    } else {
      const fallbackPool = await getCoverPoolFromFactory(
        tokenOut.address,
        tokenIn.address,
      )
      setCoverRoute(fallbackPool['data']['coverPools']['0']['id'])
      if (setTokenInUsdPrice) {
        setTokenInUsdPrice(tokenOrder ? pool['data']['coverPools']['0']['token1']['usdPrice']
                                      : pool['data']['coverPools']['0']['token0']['usdPrice'])
      }
    }
    console.log('cover route', pool['data']['coverPools']['0']['id'])
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
  setAuctionLength,
  setTokenInUsdPrice?,
  setLatestTick?,
  lowerPrice?,
  upperPrice?,
  setLowerPrice?,
  setUpperPrice?
) => {
  try {
    console.log(
      'tokenIn',
      tokenIn.address.toLocaleLowerCase(),
      'tokenOut',
      tokenOut.address.toLocaleLowerCase(),
    )
    const pool = await getCoverPoolFromFactory(
      tokenIn.address,
      tokenOut.address,
    )
    const dataLength = pool['data']['coverPools'].length
    if (dataLength != 0) {
      setCoverPoolRoute(pool['data']['coverPools']['0']['id'])
      setTickSpacing(
        pool['data']['coverPools']['0']['volatilityTier']['tickSpread'],
      )
      const newLatestTick = pool['data']['coverPools']['0']['latestTick']
      const auctionLength = pool['data']['coverPools']['0']['volatilityTier']['auctionLength']
      const tickSpread = pool['data']['coverPools']['0']['volatilityTier']['tickSpread']
      console.log('test1')
      if (setCoverPrice) setCoverPrice(TickMath.getPriceStringAtTick(newLatestTick))
      if (setAuctionLength) setAuctionLength(auctionLength)
      if (setTickSpacing) setTickSpacing(tickSpread)
      if (setTokenInUsdPrice) {
        console.log('setting tokenIn price usd', pool['data']['coverPools']['0']['token0']['usdPrice'])
        setTokenInUsdPrice(parseFloat(tokenOrder ? pool['data']['coverPools']['0']['token0']['usdPrice']
                                                 : pool['data']['coverPools']['0']['token1']['usdPrice']))
      }
      console.log('test2')
      if (setLatestTick) {
        setLatestTick(newLatestTick)
        console.log('setting default lower price', lowerPrice, isNaN(parseFloat(lowerPrice)))
        if (isNaN(parseFloat(lowerPrice)) && setLowerPrice) {
          console.log('set lower price', TickMath.getPriceStringAtTick(tokenOrder ? newLatestTick - tickSpread * 10 : newLatestTick + tickSpread, tickSpread))
          setLowerPrice(TickMath.getPriceStringAtTick(tokenOrder ? newLatestTick - tickSpread * 10 : newLatestTick + tickSpread, tickSpread))
        }
        if (isNaN(parseFloat(upperPrice)) && setUpperPrice) {
          setUpperPrice(TickMath.getPriceStringAtTick(tokenOrder ? newLatestTick - tickSpread : newLatestTick + tickSpread * 10, tickSpread))
        }
      }
      console.log('test3')
    } else {
      setCoverPoolRoute(ZERO_ADDRESS)
      setCoverPrice('1.00')
      setTickSpacing(10)
      setTokenInUsdPrice('1.00')
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

export const feeTiers = [
  {
    id: 1,
    tier: '0.01%',
    tierId: 100,
    text: 'Best for very stable pairs',
    unavailable: false,
  },
  {
    id: 2,
    tier: '0.05%',
    tierId: 500,
    text: 'Best for stable pairs',
    unavailable: false,
  },
  {
    id: 3,
    tier: '0.3%',
    tierId: 300,
    text: 'Best for most pairs',
    unavailable: false,
  },
  {
    id: 4,
    tier: '1%',
    tierId: 1000,
    text: 'Best for exotic pairs',
    unavailable: false,
  },
]

