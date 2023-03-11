import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

export const cleanInputValue = (arg) => {
    const re = /^[+-]?\d*(?:[.,]\d*)?$/
    let inputVal = arg
    if (re.test(inputVal)) {
        return inputVal.replace(',', '.')
    }
}

export const countDecimals = (value, tokenDecimals) => {
    if ((value % 1) != 0) {
        let valueDecimals = value.toString().split(".")[1].length
        return valueDecimals > tokenDecimals || valueDecimals == tokenDecimals;
    }
    return false;
};

export const getPreviousTicksLower = (token0, token1, index) => {
    return new Promise(function(resolve) {
        const getTicks =`
        { 
          ticks(
             where: {index_lt:"${index}", pool_: {token0:"${token1.toLowerCase()}" , token1: "${token0.toLowerCase()}"}}
             first: 1
           ) {
             index
           }
         }
         `
          const client = new ApolloClient({
              uri: "https://api.thegraph.com/subgraphs/name/alphak3y/poolshark-hedge-pool",
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

export const getPreviousTicksUpper = (token0, token1, index) => {
    return new Promise(function(resolve) {
        const getTicks =`
       { 
         ticks(
            where: {index_gt:"${index}", pool_: {token0: "${token1.toLowerCase()}", token1:"${token0.toLowerCase()}"}}
            first: 1
          ) {
            index
          }
        }
        `
          const client = new ApolloClient({
              uri: "https://api.thegraph.com/subgraphs/name/alphak3y/poolshark-hedge-pool",
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



export const fetchPositions =  (address) => {
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
                factory
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
            }
              txnHash
              upper
          }
        }
      `
      const client = new ApolloClient({
          uri: "https://api.thegraph.com/subgraphs/name/alphak3y/poolshark-hedge-pool",
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
                    factory
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
                }
            }
        `
          const client = new ApolloClient({
              uri: "https://api.thegraph.com/subgraphs/name/alphak3y/poolshark-hedge-pool",
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

export const fetchTokens =  (id) => {
    return new Promise(function(resolve) {
      const tokensQuery =`
        {
            tokens(where: {id:"${id.toLowerCase()}"}, orderBy: name, orderDirection: asc) {
                decimals
                id
                name
                symbol
            }
          }
        `
        const client = new ApolloClient({
            uri: "https://api.thegraph.com/subgraphs/name/alphak3y/poolshark-hedge-pool",
            cache: new InMemoryCache(),
        })
        client
            .query({ query: gql(tokensQuery), })
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

export const fetchUniV3Positions =  (address) => {
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
                    pool{
                        id
                        liquidity
                        sqrtPrice
                        totalValueLockedETH
                        totalValueLockedToken0
                        totalValueLockedToken1
                        totalValueLockedUSD
                    }
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



