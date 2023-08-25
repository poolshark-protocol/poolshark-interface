import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { BigNumber } from "ethers";

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
  tokenA?: string,
  tokenB?: string,
  feeTierId?: number
) => {
  const token0 = tokenA.localeCompare(tokenB) < 0 ? tokenA : tokenB;
  const token1 = tokenA.localeCompare(tokenB) < 0 ? tokenB : tokenA;
  return new Promise(function (resolve) {
    const getPool = isNaN(feeTierId)
      ? `
        {
          basePrices(where:{id: "eth"}){
            USD
          }
          limitPools(where: {token0_: {id:"${token0.toLocaleLowerCase()}"}, token1_:{id:"${token1.toLocaleLowerCase()}"}}) {
            id
            poolPrice
            tickAtPrice
            token0{
              usdPrice
            }
            token1{
              usdPrice
            }
            feeTier {
              id
              feeAmount
              tickSpacing
            }
          }
        }
        `
      : `
        {
          limitPools(where: {token0_: {id:"${token0.toLocaleLowerCase()}"}, token1_:{id:"${token1.toLocaleLowerCase()}"}, feeTier_: {id: "${feeTierId}"}}) {
            id
            poolPrice
            tickAtPrice
            feeTier {
              tickSpacing
            }
            token0 {
              usdPrice
            }
            token1 {
              usdPrice
            }
          }
        }
        `;
    const client = new ApolloClient({
      uri: "https://arbitrum-goerli.graph-eu.p2pify.com/d27bd45407f722ba56aaf8b7a32c7b1b/limit-test-arbitrumGoerli",
      cache: new InMemoryCache(),
    });
    client
      .query({ query: gql(getPool) })
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

export const getCoverPoolFromFactory = (tokenA: string, tokenB: string) => {
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
              }
              token0 {
                usdPrice
              }
              token1 {
                usdPrice
              }
            }
          }
         `;
    //console.log('query:', getPool)
    const client = new ApolloClient({
      uri: "https://arbitrum-goerli.graph-eu.p2pify.com/aa7fdd1e6b48d05ea1754514f3e816f5/cover-arbitrumGoerli",
      cache: new InMemoryCache(),
    });
    client
      .query({ query: gql(getPool) })
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

export const getLimitPoolFromFactory = (tokenA: string, tokenB: string) => {
  const token0 = tokenA.localeCompare(tokenB) < 0 ? tokenA : tokenB;
  const token1 = tokenA.localeCompare(tokenB) < 0 ? tokenB : tokenA;
  return new Promise(function (resolve) {
    const getPool = `
        {
            limitPools(where: {token0_: {id:"${token0.toLocaleLowerCase()}"}, token1_:{id:"${token1.toLocaleLowerCase()}"}}) {
              id
              feeTier {
                feeAmount
                tickSpacing
              }
              tickSpacing
              pool0price
              pool1price
              price0
              price1
            }
          }
         `;
    //console.log('query:', getPool)
    const client = new ApolloClient({
      uri: "https://arbitrum-goerli.graph-eu.p2pify.com/d27bd45407f722ba56aaf8b7a32c7b1b/limit-test-arbitrumGoerli",
      cache: new InMemoryCache(),
    });
    client
      .query({ query: gql(getPool) })
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

export const getTickIfZeroForOne = (
  upper: number,
  poolAddress: string,
  epochLast: number
) => {
  return new Promise(function (resolve) {
    const getTicks = `
       { 
         ticks(
            first: 1
            where: {index_lte:"${upper}", pool_:{id:"${poolAddress}"},epochLast_gt:"${epochLast}"}
          ) {
            index
          }
        }
        `;
    //console.log('pool address', poolAddress)
    const client = new ApolloClient({
      uri: "https://arbitrum-goerli.graph-eu.p2pify.com/aa7fdd1e6b48d05ea1754514f3e816f5/cover-arbitrumGoerli",
      cache: new InMemoryCache(),
    });
    client
      .query({ query: gql(getTicks) })
      .then((data) => {
        resolve(data);
        /* console.log(data) */
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const getTickIfNotZeroForOne = (
  lower: number,
  poolAddress: string,
  epochLast: number
) => {
  return new Promise(function (resolve) {
    const getTicks = `
       { 
         ticks(
            first: 1
            where: {index_gte:"${lower}", pool_:{id:"${poolAddress}"},epochLast_gt:"${epochLast}"}
          ) {
            index
          }
        }
        `;
    //console.log(getTicks)
    //console.log('pool address', poolAddress)
    const client = new ApolloClient({
      uri: "https://arbitrum-goerli.graph-eu.p2pify.com/aa7fdd1e6b48d05ea1754514f3e816f5/cover-arbitrumGoerli",
      cache: new InMemoryCache(),
    });
    client
      .query({ query: gql(getTicks) })
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
  upper: number,
  poolAddress: string,
  epochLast: number
) => {
  return new Promise(function (resolve) {
    const getTicks = `
       { 
         limitTicks(
            first: 1
            where: {index_lte:"${upper}", pool_:{id:"${poolAddress}"},epochLast_gt:"${epochLast}"}
          ) {
            index
            epochLast1
          }
        }
        `;
    //console.log('pool address', poolAddress)
    const client = new ApolloClient({
      uri: "https://arbitrum-goerli.graph-eu.p2pify.com/d27bd45407f722ba56aaf8b7a32c7b1b/limit-test-arbitrumGoerli",
      cache: new InMemoryCache(),
    });
    client
      .query({ query: gql(getTicks) })
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
  lower: number,
  poolAddress: string,
  epochLast: number
) => {
  return new Promise(function (resolve) {
    const getTicks = `
       { 
         limitTicks(
            first: 1
            where: {index_gte:"${lower}", pool_:{id:"${poolAddress}"},epochLast_gt:"${epochLast}"}
          ) {
            index
            epochLast0
          }
        }
        `;
    //console.log(getTicks)
    //console.log('pool address', poolAddress)
    const client = new ApolloClient({
      uri: "https://arbitrum-goerli.graph-eu.p2pify.com/d27bd45407f722ba56aaf8b7a32c7b1b/limit-test-arbitrumGoerli",
      cache: new InMemoryCache(),
    });
    client
      .query({ query: gql(getTicks) })
      .then((data) => {
        resolve(data);
        /* console.log(data) */
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const fetchCoverPositions = (address: string) => {
  return new Promise(function (resolve) {
    const positionsQuery = `
      query($owner: String) {
          positions(where: {owner:"${address}"}) {
                id
                inAmount
                inToken{
                    id
                    name
                    symbol
                    decimals
                }
                liquidity
                zeroForOne
                upper
                lower
                amountInDeltaMax
                amountOutDeltaMax
                epochLast
                outAmount
                outToken{
                    id
                    name
                    symbol
                    decimals
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
    const client = new ApolloClient({
      uri: "https://arbitrum-goerli.graph-eu.p2pify.com/aa7fdd1e6b48d05ea1754514f3e816f5/cover-arbitrumGoerli",
      cache: new InMemoryCache(),
    });
    client
      .query({
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

export const fetchCoverPools = () => {
  return new Promise(function (resolve) {
    const poolsQuery = `
            query($id: String) {
                coverPools(id: $id) {
                    id
                    inputPool
                    token0{
                        id
                        name
                        symbol
                        decimals
                    }
                    token1{
                        id
                        name
                        symbol
                        decimals
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
    const client = new ApolloClient({
      uri: "https://arbitrum-goerli.graph-eu.p2pify.com/aa7fdd1e6b48d05ea1754514f3e816f5/cover-arbitrumGoerli",
      cache: new InMemoryCache(),
    });
    client
      .query({ query: gql(poolsQuery) })
      .then((data) => {
        resolve(data);
        /* console.log(data) */
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const fetchCoverPoolMetrics = () => {
  return new Promise(function (resolve) {
    const poolsMetricsQuery = `
            query($id: String) {
                coverPoolFactories(id: $id) {
                    id
                    poolCount
                }
            }
        `;
    const client = new ApolloClient({
      uri: "https://arbitrum-goerli.graph-eu.p2pify.com/aa7fdd1e6b48d05ea1754514f3e816f5/cover-arbitrumGoerli",
      cache: new InMemoryCache(),
    });
    client
      .query({ query: gql(poolsMetricsQuery) })
      .then((data) => {
        resolve(data);
        /* console.log(data) */
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const fetchLimitPositions = (address: string) => {
  return new Promise(function (resolve) {
    const positionsQuery = `
      query($owner: String) {
          limitPositions(where: {owner:"${address}"}) {
                id
                amountIn
                amountOut
                amountFilled
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
                    token0{
                        id
                        name
                        symbol
                        decimals
                    }
                    token1{
                        id
                        name
                        symbol
                        decimals
                    }
                    liquidity
                    liquidityGlobal
                    genesisTime
                    epoch
                    feeTier{
                        feeAmount
                        tickSpread
                    }
                    pool0price
                    pool1price
                    price0
                    price1
                    pool0liquidity
                    pool1liquidity
                    tickSpacing
                }
                txnHash
            }
        }
    `;
    const client = new ApolloClient({
      uri: "https://arbitrum-goerli.graph-eu.p2pify.com/d27bd45407f722ba56aaf8b7a32c7b1b/limit-test-arbitrumGoerli",
      cache: new InMemoryCache(),
    });
    client
      .query({
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

export const fetchLimitPools = () => {
  return new Promise(function (resolve) {
    const poolsQuery = `
            query($id: String) {
                limitPools(id: $id) {
                    id
                    inputPool
                    genesisTime
                    epoch
                    token0{
                        id
                        name
                        symbol
                        decimals
                    }
                    token1{
                        id
                        name
                        symbol
                        decimals
                    }
                    liquidity
                    liquidityGlobal
                    feeTier{
                        feeAmount
                        tickSpacing
                    }
                    tickSpacing
                    price0
                    price1
                    pool0price
                    pool1price
                    pool0liquidity
                    pool1liquidity
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
    const client = new ApolloClient({
      uri: "https://arbitrum-goerli.graph-eu.p2pify.com/d27bd45407f722ba56aaf8b7a32c7b1b/limit-test-arbitrumGoerli",
      cache: new InMemoryCache(),
    });
    client
      .query({ query: gql(poolsQuery) })
      .then((data) => {
        resolve(data);
        /* console.log(data) */
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const fetchLimitPoolMetrics = () => {
  return new Promise(function (resolve) {
    const poolsMetricsQuery = `
            query($id: String) {
                limitPoolFactories(id: $id) {
                    id
                    poolCount
                }
            }
        `;
    const client = new ApolloClient({
      uri: "https://arbitrum-goerli.graph-eu.p2pify.com/d27bd45407f722ba56aaf8b7a32c7b1b/limit-test-arbitrumGoerli",
      cache: new InMemoryCache(),
    });
    client
      .query({ query: gql(poolsMetricsQuery) })
      .then((data) => {
        resolve(data);
        /* console.log(data) */
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const fetchRangePools = () => {
  return new Promise(function (resolve) {
    const poolsQuery = `
            query($id: String) {
                limitPools(id: $id) {
                    id
                    token0{
                        id
                        name
                        symbol
                        decimals
                    }
                    token1{
                        id
                        name
                        symbol
                        decimals
                    }
                    feesEth
                    feesUsd
                    feeTier{
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
    const client = new ApolloClient({
      uri: "https://arbitrum-goerli.graph-eu.p2pify.com/d27bd45407f722ba56aaf8b7a32c7b1b/limit-test-arbitrumGoerli",
      cache: new InMemoryCache(),
    });
    client
      .query({ query: gql(poolsQuery) })
      .then((data) => {
        resolve(data);
        /* console.log(data) */
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const fetchRangePositions = (address: string) => {
  return new Promise(function (resolve) {
    const positionsQuery = `
    {
      rangePositions(where: {owner:"${address}"}) {
        id
        owner
        amount
        token{
          totalSupply
          position{
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
              }
              token1{
                  id
                  name
                  symbol
                  decimals
              }
              ticks{
                  price0
                  price1
                  liquidityDelta
                  liquidityDeltaMinus
              }
              factory{
                  id
              }
              price
              liquidity
              feeTier{
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
      }  
  }
    `;
    const client = new ApolloClient({
      uri: "https://arbitrum-goerli.graph-eu.p2pify.com/d27bd45407f722ba56aaf8b7a32c7b1b/limit-test-arbitrumGoerli",
      cache: new InMemoryCache(),
    });
    client
      .query({
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

export const fetchRangeMetrics = () => {
  return new Promise(function (resolve) {
    const positionsQuery = `
        query($id: String) {
            limitPoolFactories(id: $id) {
                id
                txnCount
                feesEthTotal
                feesUsdTotal
                poolCount
                totalValueLockedEth
                totalValueLockedUsd
                volumeEthTotal
                volumeUsdTotal
            }  
        }
    `;
    const client = new ApolloClient({
      uri: "https://arbitrum-goerli.graph-eu.p2pify.com/d27bd45407f722ba56aaf8b7a32c7b1b/limit-test-arbitrumGoerli",
      cache: new InMemoryCache(),
    });
    client
      .query({
        query: gql(positionsQuery),
      })
      .then((data) => {
        resolve(data);
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
      .query({ query: gql(univ3PoolsQuery) })
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
      .query({
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

export const fetchPrice = (address: string) => {
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
      .query({
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
