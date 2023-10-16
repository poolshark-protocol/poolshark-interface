import { BigNumber } from "ethers";
import {
  getLimitTickIfNotZeroForOne,
  getLimitTickIfZeroForOne,
  getCoverTickIfNotZeroForOne,
  getCoverTickIfZeroForOne,
} from "./queries";

export const getClaimTick = async (
  poolAddress: string,
  minLimit: number,
  maxLimit: number,
  zeroForOne: boolean,
  epochLast: number,
  isCover: boolean,
  latestTick?: number
) => {
  // default to start tick
  let claimTick: number;
  if (zeroForOne) {
    // run claim tick query
    const claimTickQuery = isCover
      ? await getCoverTickIfZeroForOne(minLimit, maxLimit, poolAddress, epochLast)
      : await getLimitTickIfZeroForOne(minLimit, maxLimit, poolAddress, epochLast);
    // check data length
    const claimTickDataLength = isCover
      ? claimTickQuery["data"]["ticks"].length
      : claimTickQuery["data"]["limitTicks"].length;
    // set claim tick if found
    if (claimTickDataLength > 0) {
      claimTick = isCover
        ? claimTickQuery["data"]["ticks"][0]["index"]
        : claimTickQuery["data"]["limitTicks"][0]["index"];
      // handle latest tick for cover positions
      if (isCover && latestTick) {
        // if latest further than claim tick
        if (latestTick < claimTick) {
          // if latest is past position bounds
          if (latestTick <= minLimit) {
            claimTick = minLimit
          } else {
            claimTick = latestTick
          }
        }
      }
    } else {
      claimTick = isCover ? maxLimit : minLimit
    }
  } else {
    // run claim tick query
    const claimTickQuery = isCover
      ? await getCoverTickIfNotZeroForOne(minLimit, maxLimit, poolAddress, epochLast)
      : await getLimitTickIfNotZeroForOne(minLimit, maxLimit, poolAddress, epochLast);
    // check data length
    const claimTickDataLength = isCover
      ? claimTickQuery["data"]["ticks"].length
      : claimTickQuery["data"]["limitTicks"].length;
    // set claim tick if found
    if (claimTickDataLength > 0) {
      claimTick = isCover
        ? claimTickQuery["data"]["ticks"][0]["index"]
        : claimTickQuery["data"]["limitTicks"][0]["index"];
      // handle latest tick for cover positions
      if (isCover && latestTick) {
        // if latest further than claim tick
        if (latestTick > claimTick) {
          // if latest is past position bounds
          if (latestTick >= maxLimit) {
            claimTick = maxLimit
          } else {
            claimTick = latestTick
          }
        }
      }
    } else {
      claimTick = isCover ? minLimit : maxLimit
    }
  }
  return claimTick;
};

export function mapUserRangePositions(rangePositions) {
  const mappedRangePositions = [];
  rangePositions?.map((rangePosition) => {
    const rangePositionData = {
      id: rangePosition.id,
      positionId: rangePosition.positionId,
      poolId: rangePosition.pool.id,
      tokenZero: rangePosition.pool.token0,
      valueTokenZero: rangePosition.pool.token0.usdPrice,
      tokenOne: rangePosition.pool.token1,
      valueTokenOne: rangePosition.pool.token0.usdPrice,
      pool: rangePosition.pool,
      min: rangePosition.lower,
      max: rangePosition.upper,
      price: rangePosition.pool.poolPrice,
      tickSpacing: rangePosition.pool.feeTier.tickSpacing,
      feeTier: rangePosition.pool.feeTier.feeAmount,
      unclaimedFees: rangePosition.pool.feesUsd,
      liquidity: rangePosition.pool.liquidity,
      userLiquidity: rangePosition.liquidity,
      tvlUsd: (
        parseFloat(rangePosition.pool.totalValueLockedUsd) / 1_000_000
      ).toFixed(2),
      volumeUsd: (parseFloat(rangePosition.pool.volumeUsd) / 1_000_000).toFixed(
        2
      ),
      volumeEth: (parseFloat(rangePosition.pool.volumeEth) / 1).toFixed(2),
      userOwnerAddress: rangePosition.owner.replace(/"|'/g, ""),
    };
    mappedRangePositions.push(rangePositionData);
  });
  return mappedRangePositions;
}

export function mapRangePools(rangePools) {
  const mappedRangePools = [];
  rangePools.map((rangePool) => {
    const rangePoolData = {
      poolId: rangePool.id,
      tokenOne: rangePool.token1,
      tokenZero: rangePool.token0,
      price: rangePool.price,
      liquidity: rangePool.liquidity,
      feeTier: rangePool.feeTier.feeAmount,
      tickSpacing: rangePool.feeTier.tickSpacing,
      feesUsd: parseFloat(rangePool.feesUsd).toFixed(2),
      tvlUsd: parseFloat(rangePool.totalValueLockedUsd).toFixed(2),
      volumeUsd: parseFloat(rangePool.volumeUsd).toFixed(2),
      volumeEth: parseFloat(rangePool.volumeEth).toFixed(2),
    };
    mappedRangePools.push(rangePoolData);
  });
  return mappedRangePools;
}

export function mapUserCoverPositions(coverPositions) {
  const mappedCoverPositions = [];
  coverPositions.map((coverPosition) => {
    const coverPositionData = {
      id: coverPosition.id,
      positionId: coverPosition.positionId,
      poolId: coverPosition.pool.id,
      pool: coverPosition.pool,
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
      volatilityTier: coverPosition.pool.volatilityTier,
      tickSpacing: coverPosition.pool.volatilityTier.tickSpread,
      userOwnerAddress: coverPosition.owner.replace(/"|'/g, ""),
    };
    mappedCoverPositions.push(coverPositionData);
  });
  mappedCoverPositions.map(async (coverPosition) => {
    coverPosition.claim = await getClaimTick(
      coverPosition.poolId,
      coverPosition.min,
      coverPosition.max,
      coverPosition.zeroForOne,
      coverPosition.epochLast,
      true
    );
  });
  return mappedCoverPositions;
}

export function mapCoverPools(coverPools) {
  const mappedCoverPools = [];
  coverPools.map((coverPool) => {
    const coverPoolData = {
      poolId: coverPool.id,
      tokenOne: coverPool.token1,
      tokenZero: coverPool.token0,
      liquidity: coverPool.liquidity,
      auctionLenght: coverPool.volatilityTier.auctionLength,
      volatilityTier: coverPool.volatilityTier,
      tickSpread: coverPool.volatilityTier.tickSpread,
      feesUsd: parseFloat(coverPool.feesUsd).toFixed(2),
      tvlUsd: parseFloat(coverPool.totalValueLockedUsd).toFixed(2),
      volumeUsd: parseFloat(coverPool.volumeUsd).toFixed(2),
      volumeEth: parseFloat(coverPool.volumeEth).toFixed(2),
    };
    mappedCoverPools.push(coverPoolData);
  });
  return mappedCoverPools;
}

export function mapUserLimitPositions(limitPositions) {
  const mappedLimitPositions = [];
  limitPositions?.map((limitPosition) => {
    const limitPositionData = {
      timestamp: limitPosition.createdAtTimestamp,
      positionId: limitPosition.positionId,
      poolId: limitPosition.pool.id,
      amountIn: limitPosition.amountIn,
      amountFilled: limitPosition.amountFilled,
      claimPriceLast: limitPosition.claimPriceLast,
      liquidity: limitPosition.liquidity,
      poolLiquidity: limitPosition.pool.liquidity,
      poolLiquidityGlobal: limitPosition.pool.liquidityGlobal,
      min: limitPosition.lower,
      max: limitPosition.upper,
      tickSpacing: limitPosition.pool.tickSpacing,
      epochLast: limitPosition.epochLast,
      tokenIn: limitPosition.tokenIn,
      tokenOut: limitPosition.tokenOut,
      price0: limitPosition.pool.price0,
      price1: limitPosition.pool.price1,
      feeTierProperties: limitPosition.pool.feeTier,
      feeTier: limitPosition.pool.feeTier.feeAmount,
      userOwnerAddress: limitPosition.owner.replace(/"|'/g, ""),
    };
    mappedLimitPositions.push(limitPositionData);
  });
  return mappedLimitPositions;
}
