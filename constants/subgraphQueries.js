import { gql } from '@apollo/client';

export const GET_POSITIONS = gql`
    {
        positions(
            orderBy: createdAtTimestamp
            orderDirection: desc
        ) {
            id
            inAmount
            inToken {
                id
                name
                symbol
                decimals
            }
            liquidity
            lower
            outAmount
            outToken {
                id
                name
                symbol
                decimals
            }
            owner
            pool {
                factory
                id
                inputPool
                token0 {
                    id
                    name
                    symbol
                    decimals
                }
                token1 {
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
    `;

export const POOLS_QUERY = gql`
    {
        hedgePools(
            orderBy: id
            orderDirection: desc
        ) {
            factory
            id
            inputPool
            token0 {
                id
                name
                symbol
                decimals
            }
            token1 {
                id
                name
                symbol
                decimals
            }
        }
    }
    `;

export const TOKENS_QUERY = gql`
    {
        tokens(
            orderBy: id
            orderDirection: desc
        ) {
            id
            name
            symbol
            decimals
        }
    }
    `;




