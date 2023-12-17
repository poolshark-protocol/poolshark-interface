import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
  gql,
} from "@apollo/client";
import { BigNumber } from "ethers";
import { CoverSubgraph, LimitSubgraph } from "./types";

export interface PoolState {
  unlocked: number;
  protocolFee: number;
  tickAtPrice: number;
  tickSecondsAccum: BigNumber;
  secondsPerLiquidityAccum: BigNumber;
  price: BigNumber;
  liquidity: BigNumber;
  liquidityGlobal: BigNumber;
  feeGrowthGlobal0: BigNumber;
  feeGrowthGlobal1: BigNumber;
  samples: SampleState;
  protocolFees: ProtocolFees;
}

interface SampleState {
  index: number;
  length: number;
  lengthNext: number;
}

interface ProtocolFees {
  token0: BigNumber;
  token1: BigNumber;
}

export const cleanInputValue = (arg: string) => {
  const re = /^[+-]?\d*(?:[.,]\d*)?$/;
  let inputVal = arg;
  if (re.test(inputVal)) {
    return inputVal.replace(",", ".");
  }
};

export const countDecimals = (value: number, tokenDecimals: number) => {
  if (value % 1 != 0) {
    let valueDecimals = value.toString().split(".")[1].length;
    return valueDecimals > tokenDecimals || valueDecimals == tokenDecimals;
  }
  return false;
};

export const getRangePoolFromFactory = (
  client: LimitSubgraph,
  tokenA?: string,
  tokenB?: string
) => {
  const token0 = tokenA.localeCompare(tokenB) < 0 ? tokenA : tokenB;
  const token1 = tokenA.localeCompare(tokenB) < 0 ? tokenB : tokenA;
  return new Promise(function (resolve) {
    const getPool = `
        {
          limitPools(
            where: {token0_: {id:"${token0.toLocaleLowerCase()}"}, token1_:{id:"${token1.toLocaleLowerCase()}"}},
            orderBy: poolLiquidity,
            orderDirection: desc
          ) {
            id
            poolPrice
            tickAtPrice
            feeTier {
              id
              feeAmount
              tickSpacing
            }
            token0 {
              usdPrice
            }
            token1 {
              usdPrice
            }
            poolToken
          }
        }
        `;
    client
      ?.query({ query: gql(getPool) })
      .then((data) => {
        resolve(data);
        /* console.log(data) */
      })
      .catch((err) => {
        resolve(err);
        console.log(err);
      });
  });
};

export const getCoverPoolFromFactory = (
  client: CoverSubgraph,
  tokenA: string,
  tokenB: string
) => {
  const token0 = tokenA.localeCompare(tokenB) < 0 ? tokenA : tokenB;
  const token1 = tokenA.localeCompare(tokenB) < 0 ? tokenB : tokenA;
  return new Promise(function (resolve) {
    const getPool = `
        {
            coverPools(where: {token0_: {id:"${token0.toLocaleLowerCase()}"}, token1_:{id:"${token1.toLocaleLowerCase()}"}}) {
              id
              latestTick
              volatilityTier {
                tickSpread
                auctionLength
                feeAmount
                twapLength
              }
              token0 {
                id
                name
                symbol
                decimals
                usdPrice
              }
              token1 {
                id
                name
                symbol
                decimals
                usdPrice
              }
            }
            volatilityTiers(first: 5) {
              tickSpread
              auctionLength
              feeAmount
              twapLength
            }
          }
         `;
    const client = new ApolloClient({
      uri: "https://arbitrum-goerli.graph-eu.p2pify.com/e1fce33d6c91a225a19e134ec9eeff22/staging-cover-arbitrumGoerli",
      cache: new InMemoryCache(),
    }); //TODO: arbitrumOne values
    client
      ?.query({ query: gql(getPool) })
      .then((data) => {
        resolve(data);
        /* console.log(data) */
      })
      .catch((err) => {
        resolve(err);
        console.log(err);
      });
  });
};

export const getLimitPoolFromFactory = (
  client: LimitSubgraph,
  tokenA: string,
  tokenB: string
) => {
  const token0 = tokenA.localeCompare(tokenB) < 0 ? tokenA : tokenB;
  const token1 = tokenA.localeCompare(tokenB) < 0 ? tokenB : tokenA;
  return new Promise(function (resolve) {
    const getPool = `
        {
            limitPools(
              where: {token0_: {id:"${token0.toLocaleLowerCase()}"}, token1_:{id:"${token1.toLocaleLowerCase()}"}},
              orderBy: poolLiquidity,
              orderDirection: desc
            ) {
              id
              epoch
              token0{
                  id
                  name
                  symbol
                  decimals
                  usdPrice
              }
              token1{
                  id
                  name
                  symbol
                  decimals
                  usdPrice
              }
              liquidity
              liquidityGlobal
              feeTier{
                  id
                  feeAmount
                  tickSpacing
              }
              tickSpacing
              poolPrice
              pool0Price
              pool1Price
              price0
              price1
              poolPrice
              feesEth
              feesUsd
              volumeEth
              volumeToken0
              volumeToken1
              volumeUsd
              totalValueLockedEth
              totalValueLocked0
              totalValueLocked1
              totalValueLockedUsd
            }
          }
         `;
    client
      ?.query({ query: gql(getPool) })
      .then((data) => {
        resolve(data);
        /* console.log(data) */
      })
      .catch((err) => {
        resolve(err);
        console.log(err);
      });
  });
};

export const getCoverTickIfZeroForOne = (
  client: CoverSubgraph,
  lower: number,
  upper: number,
  poolAddress: string,
  epochLast: number
) => {
  return new Promise(function (resolve) {
    const getTicks = `
      { 
        ticks(
          first: 1
          where: {index_gte:"${lower}", index_lte:"${upper}", pool_:{id:"${poolAddress}"}, epochLast0_gt:"${epochLast}"}
          orderBy: index
          orderDirection: asc
        ) {
          index
        }
      }
        `;
    client
      ?.query({ query: gql(getTicks) })
      .then((data) => {
        resolve(data);
        /* console.log(data) */
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const getCoverTickIfNotZeroForOne = (
  client: CoverSubgraph,
  lower: number,
  upper: number,
  poolAddress: string,
  epochLast: number
) => {
  return new Promise(function (resolve) {
    const getTicks = `
      { 
        ticks(
          first: 1
          where: {index_gte:"${lower}", index_lte:"${upper}", pool_:{id:"${poolAddress}"},epochLast1_gt:"${epochLast}"}
          orderBy: index
          orderDirection: desc
        ) {
          index
        }
      }
        `;
    client
      ?.query({ query: gql(getTicks) })
      .then((data) => {
        resolve(data);
        /* console.log(data) */
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const getLimitTickIfNotZeroForOne = (
  client: LimitSubgraph,
  lower: number,
  upper: number,
  poolAddress: string,
  epochLast: number
) => {
  return new Promise(function (resolve) {
    const getTicks = `
      { 
        limitTicks(
          first: 1
          where: {index_gte:"${lower}", index_lte:"${upper}", pool_:{id:"${poolAddress}"}, epochLast1_gt:"${epochLast}"}
          orderBy: index
          orderDirection: asc
        ) {
          index
        }
      }
        `;
    client
      ?.query({ query: gql(getTicks) })
      .then((data) => {
        resolve(data);
        /* console.log(data) */
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const getLimitTickIfZeroForOne = (
  client: LimitSubgraph,
  lower: number,
  upper: number,
  poolAddress: string,
  epochLast: number
) => {
  return new Promise(function (resolve) {
    const getTicks = `
      { 
        limitTicks(
          first: 1
          where: {index_gte:"${lower}", index_lte:"${upper}", pool_:{id:"${poolAddress}"}, epochLast0_gt:"${epochLast}"}
          orderBy: index
          orderDirection: desc
        ) {
          index
        }
      }
        `;
    client
      ?.query({ query: gql(getTicks) })
      .then((data) => {
        resolve(data);
        /* console.log(data) */
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const fetchCoverPositions = (client: CoverSubgraph, address: string) => {
  return new Promise(function (resolve) {
    const positionsQuery = `
      query($owner: String) {
          positions(
            where: {owner:"${address}"},
            orderBy: liquidity,
            orderDirection: desc
          ) {
                id
                positionId
                lower
                upper
                zeroForOne
                inAmount
                inToken{
                    id
                    name
                    symbol
                    decimals
                    usdPrice
                }
                liquidity
                amountInDeltaMax
                amountOutDeltaMax
                epochLast
                outAmount
                outToken{
                    id
                    name
                    symbol
                    decimals
                    usdPrice
                }
                owner
                pool{
                    id
                    token0{
                        id
                        name
                        symbol
                        decimals
                        usdPrice
                    }
                    token1{
                        id
                        name
                        symbol
                        decimals
                        usdPrice
                    }
                    liquidity
                    volatilityTier{
                        feeAmount
                        tickSpread
                        auctionLength
                    }
                    latestTick
                }
                txnHash
            }
        }
    `;
    client
      ?.query({
        query: gql(positionsQuery),
        variables: {
          owner: address,
        },
      })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const fetchCoverPools = (client: CoverSubgraph) => {
  return new Promise(function (resolve) {
    const poolsQuery = `
            query($id: String) {
                coverPools(orderBy: totalValueLockedUsd, orderDirection: desc) {
                    id
                    inputPool
                    token0{
                        id
                        name
                        symbol
                        decimals
                        usdPrice
                    }
                    token1{
                        id
                        name
                        symbol
                        decimals
                        usdPrice
                    }
                    liquidity
                    volatilityTier{
                        auctionLength
                        feeAmount
                        tickSpread
                    }
                    price0
                    price1
                    feesEth
                    feesUsd
                    volumeEth
                    volumeToken0
                    volumeToken1
                    volumeUsd
                    totalValueLockedEth
                    totalValueLocked0
                    totalValueLocked1
                    totalValueLockedUsd
                }
            }
        `;
    client
      ?.query({ query: gql(poolsQuery) })
      .then((data) => {
        resolve(data);
        /* console.log(data) */
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const fetchCoverPoolMetrics = (client: CoverSubgraph) => {
  return new Promise(function (resolve) {
    const poolsMetricsQuery = `
            query($id: String) {
                coverPoolFactories(id: $id) {
                    id
                    poolCount
                }
            }
        `;
    client
      ?.query({ query: gql(poolsMetricsQuery) })
      .then((data) => {
        resolve(data);
        /* console.log(data) */
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const fetchLimitPositions = (client: LimitSubgraph, address: string) => {
  return new Promise(function (resolve) {
    const positionsQuery = `
    {
        limitPositions(
          where: {owner:"${address}"},
          orderBy: createdAtTimestamp,
          orderDirection: desc
        ) {
            id
            positionId
            createdAtTimestamp
            amountIn
            amountFilled
            zeroForOne
            tokenIn{
                id
                name
                symbol
                decimals
            }
            tokenOut{
              id
              name
              symbol
              decimals
            }
            liquidity
            lower
            upper
            epochLast
            claimPriceLast
            owner
            pool{
                id
                liquidity
                liquidityGlobal
                epoch
                feeTier{
                  id
                  feeAmount
                  tickSpacing
                }
                price0
                price1
                poolPrice
                tickSpacing
            }
            txnHash
        }
        historicalOrders(
          where: {owner:"${address}", completed: true},
          orderBy: completedAtTimestamp,
          orderDirection: desc
        ) {
            id
            tokenIn{
              id
              name
              symbol
              decimals
            }
            pool {
              id
            }
            tokenOut{
              id
              name
              symbol
              decimals
            }
            amountIn
            amountOut
            averagePrice
            completedAtTimestamp
            completed
            owner
        }
      }
    `;
    client
      ?.query({
        query: gql(positionsQuery),
        variables: {
          owner: address,
        },
      })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const fetchLimitPools = (client: LimitSubgraph) => {
  return new Promise(function (resolve) {
    const poolsQuery = `
            query($id: String) {
                limitPools(
                  orderBy: poolLiquidity,
                  orderDirection: desc
                ) {
                    id
                    epoch
                    token0{
                        id
                        name
                        symbol
                        decimals
                        usdPrice
                    }
                    token1{
                        id
                        name
                        symbol
                        decimals
                        usdPrice
                    }
                    liquidity
                    liquidityGlobal
                    feeTier{
                        id
                        feeAmount
                        tickSpacing
                    }
                    tickSpacing
                    price0
                    price1
                    poolPrice
                    feesEth
                    feesUsd
                    volumeEth
                    volumeToken0
                    volumeToken1
                    volumeUsd
                    totalValueLockedEth
                    totalValueLocked0
                    totalValueLocked1
                    totalValueLockedUsd
                }
            }
        `;
    client
      ?.query({ query: gql(poolsQuery) })
      .then((data) => {
        resolve(data);
        /* console.log(data) */
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const fetchLimitPoolMetrics = (client: LimitSubgraph) => {
  return new Promise(function (resolve) {
    const poolsMetricsQuery = `
            query($id: String) {
                limitPoolFactories(id: $id) {
                    id
                    poolCount
                }
            }
        `;
    client
      ?.query({ query: gql(poolsMetricsQuery) })
      .then((data) => {
        resolve(data);
        /* console.log(data) */
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const fetchRangePools = (client: LimitSubgraph) => {
  return new Promise(function (resolve) {
    const poolsQuery = `
            query($id: String) {
                limitPools(id: $id, orderBy: totalValueLockedUsd, orderDirection: desc) {
                    id
                    token0{
                        id
                        name
                        symbol
                        decimals
                        usdPrice
                    }
                    token1{
                        id
                        name
                        symbol
                        decimals
                        usdPrice
                    }
                    feesEth
                    feesUsd
                    feeTier{
                        id
                        tickSpacing
                        feeAmount
                    }
                    poolPrice
                    price0
                    price1
                    liquidity
                    feesEth
                    feesUsd
                    feeGrowthGlobal0
                    feeGrowthGlobal1
                    volumeEth
                    volumeToken0
                    volumeToken1
                    volumeUsd
                    totalValueLockedEth
                    totalValueLocked0
                    totalValueLocked1
                    totalValueLockedUsd
                    txnCount
                }
            }
        `;
    client
      ?.query({ query: gql(poolsQuery) })
      .then((data) => {
        resolve(data);
        /* console.log(data) */
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const fetchRangePositions = (client: LimitSubgraph, address: string) => {
  return new Promise(function (resolve) {
    const positionsQuery = `
    {
      rangePositions(
        where: {owner:"${address}"},
        orderBy: liquidity,
        orderDirection: desc
      ) {
            id
            positionId
            owner
            staked
            lower
            upper
            liquidity
            pool {
              id
              token0{
                  id
                  name
                  symbol
                  decimals
                  usdPrice
              }
              token1{
                  id
                  name
                  symbol
                  decimals
                  usdPrice
              }
              factory{
                  id
              }
              poolPrice
              liquidity
              feeTier{
                  id
                  feeAmount
                  tickSpacing
              }
              feesEth
              feesUsd
              totalValueLockedEth
              totalValueLockedUsd
              totalValueLocked0
              totalValueLocked1
              volumeEth
              volumeToken0
              volumeToken1
              volumeUsd
            }
      }  
  }
    `;
    client
      ?.query({
        query: gql(positionsQuery),
        variables: {
          owner: address,
        },
      })
      .then((data) => {
        resolve(data);
        //console.log(data)
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const fetchUniV3Pools = () => {
  return new Promise(function (resolve) {
    const univ3PoolsQuery = `
            query($id: String) {
                pools(id: $id) {
                    id
                    tick
                    liquidity
                    sqrtPrice
                    totalValueLockedETH
                    totalValueLockedToken0
                    totalValueLockedToken1
                    totalValueLockedUSD
                    token1{
                        id
                        name
                        symbol
                        decimals
                    }
                    token0{
                        id
                        name
                        symbol
                        decimals
                    }
                }
            }
        `;
    const client = new ApolloClient({
      uri: "https://api.thegraph.com/subgraphs/name/liqwiz/uniswap-v3-goerli",
      cache: new InMemoryCache(),
    });
    client
      ?.query({ query: gql(univ3PoolsQuery) })
      .then((data) => {
        resolve(data);
        /* console.log(data) */
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const fetchUniV3Positions = (address: string) => {
  return new Promise(function (resolve) {
    const univ3PositionsQuery = `
            query($owner: String) {
                positions(owner: $owner) {
                    id
                    liquidity
                    owner
                    token1{
                        id
                        name
                        symbol
                        decimals
                    }
                    token0{
                        id
                        name
                        symbol
                        decimals
                    }
                    pool {
                      tick
                    }
                    depositedToken0
                    depositedToken1
                    withdrawnToken0
                    withdrawnToken1
                }
            }
        `;
    const client = new ApolloClient({
      uri: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
      cache: new InMemoryCache(),
    });
    client
      ?.query({
        query: gql(univ3PositionsQuery),
        variables: {
          owner: address,
        },
      })
      .then((data) => {
        resolve(data);
        /* console.log(data) */
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const fetchTokenPrice = (
  client: LimitSubgraph,
  tokenAddress: string
) => {
  return new Promise(function (resolve) {
    const tokenQuery = `
          { 
            tokens(
              first: 1
              where: {id:"${tokenAddress.toLowerCase()}"}
            ) {
              usdPrice
            }
          }
        `;
    client
      ?.query({
        query: gql(tokenQuery)
      })
      .then((data) => {
        resolve(data);
        /* console.log(data) */
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const fetchEthPrice = () => {
  return new Promise(function (resolve) {
    const univ3Price = `
            {
                bundles(first: 5) {
                  id
                  ethPriceUSD
                }
            }
            `;
    const client = new ApolloClient({
      uri: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
      cache: new InMemoryCache(),
    });
    client
      ?.query({
        query: gql(univ3Price),
      })
      .then((data) => {
        resolve(data);
        /* console.log(data) */
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const fetchUserVFinPositions = (client: LimitSubgraph, ownerAddress: string) => {
  return new Promise(function (resolve) {
    const userVestingQuery = `
        {
          vfinPositions(first: 1, where: { owner:"${ownerAddress}"}) {
            positionId
            owner
            vFinAddress
          }
        }
        `;
    client
      ?.query({
        query: gql(userVestingQuery),
      })
      .then((data) => {
        resolve(data);
        //console.log(data)
      })
      .catch((err) => {
        resolve(err);
      });
  });
}

export const fetchUserBonds = (marketId: string, recipient: string, subgraphUrl: string) => {
  return new Promise(function (resolve) {
    const userBondsQuery = `
        {
          bondPurchases(first: 1000, where: { recipient:"${recipient}", market_: {marketId: "${marketId}"} }, orderBy: timestamp, orderDirection: desc) {
              amount
              auctioneer
              chainId
              id
              network
              owner
              payout
              postPurchasePrice
              purchasePrice
              recipient
              referrer
              teller
              timestamp
              quoteToken {
                address
                symbol
                decimals
                id
                totalPayoutAmount
              }
              payoutToken {
                address
                symbol
                decimals
                id
                totalPayoutAmount
              }
            }
          }
        `;
    const client = new ApolloClient({
      uri: subgraphUrl,
      cache: new InMemoryCache(),
    });
    client
      ?.query({
        query: gql(userBondsQuery),
      })
      .then((data) => {
        resolve(data);
        //console.log(data)
      })
      .catch((err) => {
        resolve(err);
      });
  });
}

export const fetchBondMarket = (marketId: string, subgraphUrl: string) => {
  return new Promise(function (resolve) {
    const bondMarketQuery = `
              {
                markets(where: { hasClosed: false, marketId: "${marketId}" }) {
                  id
                  name
                  network
                  auctioneer
                  teller
                  marketId
                  owner
                  callbackAddress
                  capacity
                  capacityInQuote
                  chainId
                  minPrice
                  scale
                  start
                  conclusion
                  payoutToken {
                    id
                    address
                    symbol
                    decimals
                    name
                  }
                  quoteToken {
                    id
                    address
                    symbol
                    decimals
                    name
                    lpPair {
                      token0 {
                        id
                        address
                        symbol
                        decimals
                        name
                        typeName
                      }
                      token1 {
                        id
                        address
                        symbol
                        decimals
                        name
                        typeName
                      }
                    }
                    balancerWeightedPool {
                      id
                      vaultAddress
                      poolId
                      constituentTokens {
                        id
                        address
                        symbol
                        decimals
                        name
                        typeName
                      }
                    }
                  }
                  vesting
                  vestingType
                  isInstantSwap
                  hasClosed
                  totalBondedAmount
                  totalPayoutAmount
                  creationBlockTimestamp
                }
              }
        `;
    const client = new ApolloClient({
      uri: subgraphUrl,
      cache: new InMemoryCache(),
    });
    client
      ?.query({
        query: gql(bondMarketQuery),
      })
      .then((data) => {
        resolve(data);
        //console.log(data)
      })
      .catch((err) => {
        resolve(err);
      });
  });
}