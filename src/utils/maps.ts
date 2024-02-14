import {
  getLimitTickIfNotZeroForOne,
  getLimitTickIfZeroForOne,
  getCoverTickIfNotZeroForOne,
  getCoverTickIfZeroForOne,
} from "./queries";
import { CoverSubgraph, LimitSubgraph } from "./types";

export const getClaimTick = async (
  poolAddress: string,
  minLimit: number,
  maxLimit: number,
  zeroForOne: boolean,
  epochLast: number,
  isCover: boolean,
  client: LimitSubgraph | CoverSubgraph,
  setAddLiqDisabled: any,
  latestTick?: number
) => {
  // default to start tick
  let claimTick: number;
  if (zeroForOne) {
    // run claim tick query
    const claimTickQuery = isCover
      ? await getCoverTickIfZeroForOne(
          client,
          minLimit,
          maxLimit,
          poolAddress,
          epochLast
        )
      : await getLimitTickIfZeroForOne(
          client,
          minLimit,
          maxLimit,
          poolAddress,
          epochLast
        );
    // check data length
    let claimTickDataLength;
    if (isCover) {
      if (claimTickQuery["data"] && claimTickQuery["data"]["ticks"]) {
        claimTickDataLength = claimTickQuery["data"]["ticks"]?.length
      }
    } else {
      if (claimTickQuery["data"] && claimTickQuery["data"]["limitTicks"]) {
        claimTickDataLength = claimTickQuery["data"]["limitTicks"]?.length;
      }
    }
    // set claim tick if found
    if (claimTickDataLength != undefined && claimTickDataLength > 0) {
      if (setAddLiqDisabled != undefined) {
        setAddLiqDisabled(true);
      }
      claimTick = isCover
        ? claimTickQuery["data"]["ticks"][0]["index"]
        : claimTickQuery["data"]["limitTicks"][0]["index"];
      // handle latest tick for cover positions
      if (isCover && latestTick) {
        // if latest further than claim tick
        if (latestTick < claimTick) {
          // if latest is past position bounds
          if (latestTick <= minLimit) {
            claimTick = minLimit;
          } else {
            claimTick = latestTick;
          }
        }
      }
    } else if (claimTickDataLength != undefined) {
      if (setAddLiqDisabled != undefined) {
        setAddLiqDisabled(false);
      }
      claimTick = isCover ? maxLimit : minLimit;
    }
  } else {
    // run claim tick query
    const claimTickQuery = isCover
      ? await getCoverTickIfNotZeroForOne(
          client,
          minLimit,
          maxLimit,
          poolAddress,
          epochLast
        )
      : await getLimitTickIfNotZeroForOne(
          client,
          minLimit,
          maxLimit,
          poolAddress,
          epochLast
        );
    // check data length
    let claimTickDataLength
    if (isCover) {
      if (claimTickQuery["data"] && claimTickQuery["data"]["ticks"]) {
        claimTickDataLength = claimTickQuery["data"]["ticks"]?.length
      }
    } else {
      if (claimTickQuery["data"] && claimTickQuery["data"]["limitTicks"]) {
        claimTickDataLength = claimTickQuery["data"]["limitTicks"]?.length;
      }
    }
    // set claim tick if found
    if (claimTickDataLength && claimTickDataLength > 0) {
      if (setAddLiqDisabled != undefined) {
        setAddLiqDisabled(true);
      }
      claimTick = isCover
        ? claimTickQuery["data"]["ticks"][0]["index"]
        : claimTickQuery["data"]["limitTicks"][0]["index"];
      // handle latest tick for cover positions
      if (isCover && latestTick) {
        // if latest further than claim tick
        if (latestTick > claimTick) {
          // if latest is past position bounds
          if (latestTick >= maxLimit) {
            claimTick = maxLimit;
          } else {
            claimTick = latestTick;
          }
        }
      }
    } else if (claimTickDataLength != undefined) {
      if (setAddLiqDisabled != undefined) {
        setAddLiqDisabled(false);
      }
      claimTick = isCover ? minLimit : maxLimit;
    }
  }
  return claimTick;
};

export function mapUserRangePositions(rangePositions, setNumLegacyPositions?: any, resetNumLegacyPositions?: any) {
  const mappedRangePositions = [];
  if (resetNumLegacyPositions) {
    resetNumLegacyPositions()
  }
  rangePositions?.map((rangePosition) => {
    const rangePositionData = {
      id: rangePosition.id,
      positionId: rangePosition.positionId,
      poolId: rangePosition.pool.id,
      poolType: rangePosition.pool.poolType,
      staked: rangePosition.staked,
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
    if (rangePositionData.poolType == "0") {
      setNumLegacyPositions()
    }
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

export function mapUserCoverPositions(
  coverPositions,
  coverSubgraph: CoverSubgraph
) {
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
      true,
      coverSubgraph,
      undefined
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
      auctionLength: coverPool.volatilityTier.auctionLength,
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
      id: limitPosition.id,
      positionId: limitPosition.positionId,
      pool: limitPosition.pool,
      poolId: limitPosition.pool.id,
      amountIn: limitPosition.amountIn,
      amountFilled: limitPosition.amountFilled,
      claimPriceLast: limitPosition.claimPriceLast,
      timestamp: limitPosition.createdAtTimestamp,
      liquidity: limitPosition.liquidity,
      zeroForOne: limitPosition.zeroForOne,
      poolLiquidity: limitPosition.pool.liquidity,
      poolLiquidityGlobal: limitPosition.pool.liquidityGlobal,
      min: limitPosition.lower,
      max: limitPosition.upper,
      tickSpacing: limitPosition.pool.tickSpacing,
      epochLast: limitPosition.epochLast,
      tokenIn: {
        ...limitPosition.tokenIn,
        address: limitPosition.tokenIn.id,
        logoURI: limitPosition.tokenIn.logoURI,
      },
      tokenOut: {
        ...limitPosition.tokenOut,
        address: limitPosition.tokenOut.id,
        logoURI: limitPosition.tokenOut.logoURI,
      },
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

export function mapUserHistoricalOrders(historicalOrders) {
  const mappedHistoricalOrders = [];
  historicalOrders?.map((historicalOrder) => {
    const historicalOrderData = {
      id: historicalOrder.id,
      pool: historicalOrder.pool,
      poolId: historicalOrder.pool.id,
      amountIn: historicalOrder.amountIn,
      amountOut: historicalOrder.amountOut,
      averagePrice: historicalOrder.averagePrice,
      completedAtTimestamp: historicalOrder.completedAtTimestamp,
      completed: historicalOrder.completed,
      tokenIn: {
        ...historicalOrder.tokenIn,
        address: historicalOrder.tokenIn.id,
        logoURI: historicalOrder.tokenIn.logoURI,
      },
      tokenOut: {
        ...historicalOrder.tokenOut,
        address: historicalOrder.tokenOut.id,
        logoURI: historicalOrder.tokenOut.logoURI,
      },
      userOwnerAddress: historicalOrder.owner.replace(/"|'/g, ""),
    };
    mappedHistoricalOrders.push(historicalOrderData);
  });
  return mappedHistoricalOrders;
}

export function mapBondMarkets(markets) {
  const mappedMarkets = [];
  markets.map((market) => {
    const marketData = {
      id: market.id,
      name: market.name,
      network: market.network,
      auctioneer: market.auctioneer,
      teller: market.teller,
      marketId: market.marketId,
      owner: market.owner,
      callbackAddress: market.callbackAddress,
      capacityInQuote: market.capacityInQuote,
      chainId: market.chainId,
      scale: market.scale,
      vestingType: market.vestingType,
      isInstantSwap: market.isInstantSwap,
      hasClosed: market.hasClosed,
      payoutTokenId: market.payoutToken.id,
      payoutTokenAddress: market.payoutToken.address,
      payoutTokenSymbol: market.payoutToken.symbol,
      payoutTokenDecimals: market.payoutToken.decimals,
      payoutTokenName: market.payoutToken.name,
      quoteTokenId: market.quoteToken.id,
      quoteTokenAddress: market.quoteToken.address,
      quoteTokenSymbol: market.quoteToken.symbol,
      quoteTokenDecimals: market.quoteToken.decimals,
      quoteTokenName: market.quoteToken.name,
      start: Number(market.start),
      conclusion: Number(market.conclusion),
      vesting: Number(market.vesting),
      creationBlockTimestamp: Number(market.creationBlockTimestamp),
      capacity: market.capacity,
      minPrice: market.minPrice,
      totalBondedAmount: Number(market.totalBondedAmount),
      totalPayoutAmount: Number(market.totalPayoutAmount),
    };
    mappedMarkets.push(marketData);
  });
  return mappedMarkets;
}

export function mapUserBondPurchases(bondPurchases) {
  const mappedBondPurchases = [];
  bondPurchases.map((bondPurchase) => {
    const bondPurchaseData = {
      amount: Number(bondPurchase.amount),
      payout: Number(bondPurchase.payout),
      purchasePrice: Number(bondPurchase.purchasePrice),
      postPurchasePrice: Number(bondPurchase.postPurchasePrice),
      timestamp: Number(bondPurchase.timestamp),
      auctioneer: bondPurchase.auctioneer,
      chainId: bondPurchase.chainId,
      id: bondPurchase.id,
      network: bondPurchase.network,
      owner: bondPurchase.owner,
      recipient: bondPurchase.recipient,
      referrer: bondPurchase.referrer,
      teller: bondPurchase.teller,
      payoutTokenId: bondPurchase.payoutToken.id,
      payoutTokenAddress: bondPurchase.payoutToken.address,
      payoutTokenSymbol: bondPurchase.payoutToken.symbol,
      payoutTokenDecimals: bondPurchase.payoutToken.decimals,
      payoutTokenPayoutAmount: Number(bondPurchase.payoutToken.totalPayoutAmount),
      quoteTokenId: bondPurchase.quoteToken.id,
      quoteTokenAddress: bondPurchase.quoteToken.address,
      quoteTokenSymbol: bondPurchase.quoteToken.symbol,
      quoteTokenDecimals: bondPurchase.quoteToken.decimals,
      quoteTokenPayoutAmount: Number(bondPurchase.quoteToken.totalPayoutAmount),
    };
    mappedBondPurchases.push(bondPurchaseData);
  });
  return mappedBondPurchases;
}

export function mapUserVestingPositions(vestingPositions) {
  const mappedVestingPositions = [];
  vestingPositions.map((vestingPosition) => {
    const vestingPositionData = {
      id: vestingPosition.id,
      owner: vestingPosition.owner,
      positionId: vestingPosition.positionId,
      vFinAddress: vestingPosition.vFinAddress,
    };
    mappedVestingPositions.push(vestingPositionData);
  });
  return mappedVestingPositions;
}
