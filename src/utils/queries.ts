import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

export const cleanInputValue = (arg:string) => {
    const re = /^[+-]?\d*(?:[.,]\d*)?$/
    let inputVal = arg
    if (re.test(inputVal)) {
        return inputVal.replace(',', '.')
    }
}

export const countDecimals = (value:number, tokenDecimals:number) => {
    if ((value % 1) != 0) {
        let valueDecimals = value.toString().split(".")[1].length
        return valueDecimals > tokenDecimals || valueDecimals == tokenDecimals;
    }
    return false;
};

export const getPreviousTicksLower = (token0:string, token1:string, index:number) => {
    return new Promise(function(resolve) {
        //if ticks are 0/undefined then use min/max
        const getTicks =`
        { 
          ticks(
            first: 1
             where: {index_lt:"${index}",pool_:{token0:"${token0.toLowerCase()}",token1:"0xc3a0736186516792c88e2c6d9b209471651aa46e"}}
            
           ) {
             index
           }
         }
         `
        const client = new ApolloClient({
            uri: "https://api.thegraph.com/subgraphs/name/alphak3y/poolshark-cover",
            cache: new InMemoryCache(),
        })
        client
            .query({ query: gql(getTicks) })
            .then((data) => {
                resolve(data)
            })
            .catch((err) => {
                resolve(err)
                console.log(err)
            })
     })
}


    export const getPreviousTicksUpper = (token0:string, token1:string, index:number) => {
    return new Promise(function(resolve) {
        const getTicks =`
       { 
         ticks(
            first: 1
            where: {index_gt:"${index}", pool_:{token0:"${token0.toLowerCase()}",token1:"0xc3a0736186516792c88e2c6d9b209471651aa46e"}}
            
          ) {
            index
          }
        }
        `
        const client = new ApolloClient({
            uri: "https://api.thegraph.com/subgraphs/name/alphak3y/poolshark-cover",
            cache: new InMemoryCache(),
        })
        client
            .query({ query: gql(getTicks) })
            .then((data) => {
                resolve(data)
                console.log(data)
            })
            .catch((err) => {
                resolve(err)
            })
          })
    }

export const fetchPositions =  (address:string) => {
  return new Promise(function(resolve) {
    const positionsQuery =`
      query($owner: String) {
          positions(owner: $owner) {
                id
                inAmount
                inToken{
                    id
                    name
                    symbol
                    decimals
                }
                liquidity
                upper
                lower
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
                    }
                    token1{
                        id
                        name
                        symbol
                        decimals
                    }
                }
                txnHash
            }
        }
    `
    const client = new ApolloClient({
        uri: "https://api.thegraph.com/subgraphs/name/alphak3y/poolshark-cover",
        cache: new InMemoryCache(),
    
    })
    client
        .query({ 
          query: gql(positionsQuery),
          variables: {
              owner: address
          },
       })
        .then((data) => {
            resolve(data)
        })
        .catch((err) => {
            resolve(err)
        })
    })
};

export const fetchPools =  () => {
    return new Promise(function(resolve) {
        const poolsQuery =`
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
        `
        const client = new ApolloClient({
            uri: "https://api.thegraph.com/subgraphs/name/alphak3y/poolshark-cover",
            cache: new InMemoryCache(),
        })
        client
            .query({ query: gql(poolsQuery) })
            .then((data) => {
                resolve(data)
                console.log(data)
            })
            .catch((err) => {
                resolve(err)
            })
        })
    }; 

export const fetchCoverPoolMetrics =  () => {
    return new Promise(function(resolve) {
        const poolsMetricsQuery =`
            query($id: String) {
                coverPoolFactories(id: $id) {
                    id
                    poolCount
                }
            }
        `
        const client = new ApolloClient({
            uri: "https://api.thegraph.com/subgraphs/name/alphak3y/poolshark-cover",
            cache: new InMemoryCache(),
        })
        client
            .query({ query: gql(poolsMetricsQuery) })
            .then((data) => {
                resolve(data)
                console.log(data)
            })
            .catch((err) => {
                resolve(err)
            })
        })
    };
     
export const fetchRangePools =  () => {
    return new Promise(function(resolve) {
        const poolsQuery =`
            query($id: String) {
                rangePools(id: $id) {
                    id
                    factory{
                        id
                    }
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
                    }
                    ticks{
                        price0
                        price1
                        liquidityDelta
                        liquidityDeltaMinus
                    }
                    price
                    price0
                    price1
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
        `
          const client = new ApolloClient({
              uri: "https://api.thegraph.com/subgraphs/name/alphak3y/poolshark-range",
              cache: new InMemoryCache(),
          })
          client
              .query({ query: gql(poolsQuery) })
              .then((data) => {
                  resolve(data)
                  console.log(data)
              })
              .catch((err) => {
                  resolve(err)
              })
            })
};

export const fetchRangePositions =  (address: string) => {
    return new Promise(function(resolve) {
      const positionsQuery =`
        query($owner: String) {
            positions(owner: $owner) {
                id
                owner
                liquidity
                upper
                lower
                pool{
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
                    liquidity
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
    `
        const client = new ApolloClient({
            uri: "https://api.thegraph.com/subgraphs/name/alphak3y/poolshark-range",
            cache: new InMemoryCache(),
        
        })
        client
            .query({ 
              query: gql(positionsQuery),
              variables: {
                  owner: address
              },
           })
            .then((data) => {
                resolve(data)
            })
            .catch((err) => {
                resolve(err)
            })
        })
    };

export const fetchRangeMetrics =  () => {
    return new Promise(function(resolve) {
      const positionsQuery =`
        query($id: String) {
            rangePoolFactories(id: $id) {
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
    `
    const client = new ApolloClient({
        uri: "https://api.thegraph.com/subgraphs/name/alphak3y/poolshark-range",
        cache: new InMemoryCache(),
    
    })
    client
        .query({ 
          query: gql(positionsQuery)
       })
        .then((data) => {
            resolve(data)
        })
        .catch((err) => {
            resolve(err)
        })
    })
};

export const fetchUniV3Pools =  () => {
    return new Promise(function(resolve) {
        const univ3PoolsQuery =`
            query($id: String) {
                pools(id: $id) {
                    id
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
        `
        const client = new ApolloClient({
            uri: "https://api.thegraph.com/subgraphs/name/liqwiz/uniswap-v3-goerli",
            cache: new InMemoryCache(),
        })
        client
          .query({ query: gql(univ3PoolsQuery) })
          .then((data) => {
              resolve(data)
              console.log(data)
          })
          .catch((err) => {
              resolve(err)
          })
        })
};

export const fetchUniV3Positions =  (address: string) => {
    return new Promise(function(resolve) {
        const univ3PositionsQuery =`
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
                    depositedToken0
                    depositedToken1
                    withdrawnToken0
                    withdrawnToken1
                }
            }
        `
        const client = new ApolloClient({
            uri: "https://api.thegraph.com/subgraphs/name/liqwiz/uniswap-v3-goerli",
            cache: new InMemoryCache(),
        })
        client
          .query({ 
            query: gql(univ3PositionsQuery),
            variables: {
                owner: address
            }, 
        })
          .then((data) => {
              resolve(data)
              console.log(data)
          })
          .catch((err) => {
              resolve(err)
          })
        })

        
    }


    export const fetchPrice =  (address: string) => {
        return new Promise(function(resolve) {
            const univ3Price =`
            {
                bundles(first: 5) {
                  id
                  ethPriceUSD
                }
            }
            `
            const client = new ApolloClient({
                uri: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
                cache: new InMemoryCache(),
            })
            client
              .query({ 
                query: gql(univ3Price),
            })
              .then((data) => {
                  resolve(data)
                  console.log(data)
              })
              .catch((err) => {
                  resolve(err)
              })
            })
    
            
        }


