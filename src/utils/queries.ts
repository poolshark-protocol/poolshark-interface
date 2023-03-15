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

export const getPreviousTicksLower = (token0:string, token1:string, index:string) => {
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

export const getPreviousTicksUpper = (token0:string, token1:string, index:string) => {
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

export const fetchTokens =  (id:string) => {
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



