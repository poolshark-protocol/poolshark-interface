import { getClaimTick } from "./getClaimTick"

export async function mapUserCoverPositions(coverPositions) {
    const mappedCoverPositions = []
    coverPositions.map((coverPosition) => {
      const coverPositionData = {
        poolId: coverPosition.pool.id,
        valueTokenZero: coverPosition.inAmount,
        tokenZero: coverPosition.zeroForOne
          ? coverPosition.pool.token0
          : coverPosition.pool.token1,
        tokenOne: coverPosition.zeroForOne
          ? coverPosition.pool.token1
          : coverPosition.pool.token0,
        valueTokenOne: coverPosition.outAmount,
        min: coverPosition.lower,
        max: coverPosition.upper,
        claim: undefined,
        zeroForOne: coverPosition.zeroForOne,
        userFillIn: coverPosition.amountInDeltaMax,
        userFillOut: coverPosition.amountOutDeltaMax,
        epochLast: coverPosition.epochLast,
        latestTick: coverPosition.pool.latestTick,
        liquidity: coverPosition.liquidity,
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
    //console.log('mapped positions', mappedCoverPositions)
    return mappedCoverPositions
  }