import { ApolloClient, InMemoryCache, gql, useQuery } from '@apollo/client'

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

export const fetchPositions =  (account) => {
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
          cors: {
              origin: "http://localhost:3000/",
              credentials: true
            },
      })
      client
          .query({ query: gql(positionsQuery), })
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
                hedgePools(id: $id) {
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
              cors: {
                  origin: "http://localhost:3000/",
                  credentials: true
                },
          })
          client
              .query({ query: gql(poolsQuery)})
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
            /*cors: {
                origin: "http://localhost:3000/",
                credentials: true
              },*/
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

export const fetchUserPosPool =  (id) => {
  return new Promise(function(resolve) {
    const userPosQuery =`
      {
          hedgePool(where: {id:"${id.toLowerCase()}"}) {
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
          cors: {
              origin: "http://localhost:3000/",
              credentials: true
            },
      })
      client
          .query({ query: gql(userPosQuery), })
          .then((data) => {
              resolve(data)
          })
          .catch((err) => {
              resolve(err)
          })
})
};


