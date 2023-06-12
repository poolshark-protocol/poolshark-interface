import { getTickIfNotZeroForOne, getTickIfZeroForOne } from './queries'

export const getClaimTick = async (
  coverPoolAddress: string,
  minLimit: number,
  maxLimit: number,
  zeroForOne: boolean,
  epochLast: number,
) => {
  let claimTick = zeroForOne ? maxLimit : minLimit
  if (zeroForOne) {
    const claimTickQuery = await getTickIfZeroForOne(
      Number(maxLimit),
      coverPoolAddress,
      Number(epochLast),
    )
    const claimTickDataLength = claimTickQuery['data']['ticks'].length
    if (claimTickDataLength > 0)
      claimTick = claimTickQuery['data']['ticks'][0]['index']
  } else {
    const claimTickQuery = await getTickIfNotZeroForOne(
      Number(minLimit),
      coverPoolAddress,
      Number(epochLast),
    )
    const claimTickDataLength = claimTickQuery['data']['ticks'].length
    if (claimTickDataLength > 0)
      claimTick = claimTickQuery['data']['ticks'][0]['index']
    if (claimTick == undefined) {
      claimTick = minLimit
    }
  }
  return claimTick
}

export function mapUserRangePositions(rangePositions) {
  const mappedRangePositions = []
  rangePositions.map((rangePosition) => {
    console.log('user liquidity check', Math.round(
      (rangePosition.amount / rangePosition.token.totalSupply) *
        rangePosition.token.position.liquidity,
    ))
    const rangePositionData = {
      id: rangePosition.id,
      poolId: rangePosition.token.position.pool.id,
      tokenZero: rangePosition.token.position.pool.token0,
      valueTokenZero: rangePosition.token.position.pool.token0.usdPrice,
      tokenOne: rangePosition.token.position.pool.token1,
      valueTokenOne: rangePosition.token.position.pool.token0.usdPrice,
      min: rangePosition.token.position.lower,
      max: rangePosition.token.position.upper,
      price: rangePosition.token.position.pool.price,
      tickSpacing: rangePosition.token.position.pool.feeTier.tickSpacing,
      feeTier: rangePosition.token.position.pool.feeTier.feeAmount,
      unclaimedFees: rangePosition.token.position.pool.feesUsd,
      liquidity: rangePosition.token.position.pool.liquidity,
      userLiquidity: Math.round(
        (rangePosition.amount / rangePosition.token.totalSupply) *
          rangePosition.token.position.liquidity,
      ),
      userTokenAmount: rangePosition.amount,
      tvlUsd: (
        Number(rangePosition.token.position.pool.totalValueLockedUsd) /
        1_000_000
      ).toFixed(2),
      volumeUsd: (
        Number(rangePosition.token.position.pool.volumeUsd) / 1_000_000
      ).toFixed(2),
      volumeEth: (
        Number(rangePosition.token.position.pool.volumeEth) / 1
      ).toFixed(2),
      userOwnerAddress: rangePosition.owner.replace(/"|'/g, ''),
    }
    mappedRangePositions.push(rangePositionData)
  })
  return mappedRangePositions
}

export function mapRangePools(rangePools) {
  const mappedRangePools = []
  rangePools.map((rangePool) => {
    const rangePoolData = {
      poolId: rangePool.id,
      tokenOne: rangePool.token1,
      tokenZero: rangePool.token0,
      price: rangePool.price,
      liquidity: rangePool.liquidity,
      feeTier: rangePool.feeTier.feeAmount,
      tickSpacing: rangePool.feeTier.tickSpacing,
      tvlUsd: (Number(rangePool.totalValueLockedUsd) / 1_000_000).toFixed(2),
      volumeUsd: (Number(rangePool.volumeUsd) / 1_000_000).toFixed(2),
      volumeEth: (Number(rangePool.volumeEth) / 1).toFixed(2),
    }
    mappedRangePools.push(rangePoolData)
  })
  return mappedRangePools
}

export function mapUserCoverPositions(coverPositions) {
  const mappedCoverPositions = []
  coverPositions.map((coverPosition) => {
    const coverPositionData = {
      id: coverPosition.id,
      poolId: coverPosition.pool.id,
      tokenZero: coverPosition.zeroForOne
        ? coverPosition.pool.token0
        : coverPosition.pool.token1,
      tokenOne: coverPosition.zeroForOne
        ? coverPosition.pool.token1
        : coverPosition.pool.token0,
      valueTokenZero: coverPosition.pool.token0.usdPrice,
      valueTokenOne: coverPosition.pool.token1.usdPrice,
      min: coverPosition.lower,
      max: coverPosition.upper,
      claim: undefined,
      zeroForOne: coverPosition.zeroForOne,
      userFillIn: coverPosition.amountInDeltaMax,
      userFillOut: coverPosition.amountOutDeltaMax,
      epochLast: coverPosition.epochLast,
      lowerTick: coverPosition.lower,
      upperTick: coverPosition.upper,
      latestTick: coverPosition.pool.latestTick,
      liquidity: coverPosition.liquidity,
      auctionLenght: coverPosition.pool.auctionLength,
      feeTier: coverPosition.pool.volatilityTier.feeAmount,
      tickSpacing: coverPosition.pool.volatilityTier.tickSpread,
      userOwnerAddress: coverPosition.owner.replace(/"|'/g, ''),
    }
    mappedCoverPositions.push(coverPositionData)
  })
  mappedCoverPositions.map(async (coverPosition) => {
    coverPosition.claim = await getClaimTick(
      coverPosition.poolId,
      coverPosition.min,
      coverPosition.max,
      coverPosition.zeroForOne,
      coverPosition.epochLast,
    )
  })
  return mappedCoverPositions
}

export function mapCoverPools(coverPools) {
  const mappedCoverPools = []
  coverPools.map((coverPool) => {
    const coverPoolData = {
      poolId: coverPool.id,
      tokenOne: coverPool.token1,
      tokenZero: coverPool.token0,
      liquidity: coverPool.liquidity,
      feeTier: coverPool.volatilityTier.feeAmount,
      tickSpacing: coverPool.volatilityTier.tickSpread,
      //TODO: grab usdPrice of token from range subgraph
      //totalValueLocked0 * token0.usdPrice + totalValueLocked1 * token1.usdPrice
      tvlUsd: (Number(coverPool.totalValueLockedUsd) / 1_000_000).toFixed(2),
      volumeUsd: (Number(coverPool.volumeUsd) / 1_000_000).toFixed(2),
      volumeEth: (Number(coverPool.volumeEth) / 1).toFixed(2),
    }
    mappedCoverPools.push(coverPoolData)
  })
  return mappedCoverPools
}
