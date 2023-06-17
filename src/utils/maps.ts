import { BigNumber } from 'ethers'
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
      maxLimit,
      coverPoolAddress,
      epochLast,
    )
    const claimTickDataLength = claimTickQuery['data']['ticks'].length
    if (claimTickDataLength > 0)
      claimTick = claimTickQuery['data']['ticks'][0]['index']
  } else {
    const claimTickQuery = await getTickIfNotZeroForOne(
      minLimit,
      coverPoolAddress,
      epochLast,
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
      userLiquidity: BigNumber.from(rangePosition.amount).mul(
        BigNumber.from(rangePosition.token.position.liquidity)       
      ).div(
        BigNumber.from(rangePosition.token.totalSupply)
      ).toString(),
      userTokenAmount: rangePosition.amount,
      tvlUsd: (
        parseFloat(rangePosition.token.position.pool.totalValueLockedUsd) /
        1_000_000
      ).toFixed(2),
      volumeUsd: (
        parseFloat(rangePosition.token.position.pool.volumeUsd) / 1_000_000
      ).toFixed(2),
      volumeEth: (
        parseFloat(rangePosition.token.position.pool.volumeEth) / 1
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
      tvlUsd: (parseFloat(rangePool.totalValueLockedUsd) / 1_000_000).toFixed(2),
      volumeUsd: (parseFloat(rangePool.volumeUsd) / 1_000_000).toFixed(2),
      volumeEth: (parseFloat(rangePool.volumeEth) / 1).toFixed(2),
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
      auctionLength: coverPosition.pool.auctionLength,
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
    console.log('claim tick queried', coverPosition.claim)
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
      auctionLenght: coverPool.volatilityTier.auctionLength,
      feeTier: coverPool.volatilityTier.feeAmount,
      tickSpacing: coverPool.volatilityTier.tickSpread,
      tvlUsd: (parseFloat(coverPool.totalValueLockedUsd) / 1_000_000).toFixed(2),
      volumeUsd: (parseFloat(coverPool.volumeUsd) / 1_000_000).toFixed(2),
      volumeEth: (parseFloat(coverPool.volumeEth) / 1).toFixed(2),
    }
    mappedCoverPools.push(coverPoolData)
  })
  return mappedCoverPools
}
