import { useState, createContext, useEffect, useContext } from 'react'
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { CoinContext } from './Coin.context'
import { fetchPools, fetchPositions, fetchTokens } from '../utils/queries';

export const OrdersContext = createContext()

export const FetchProvider = (props) => {
    const { coins } = useContext(CoinContext)

    const [pools, setPools] = useState(null)
    const [positions, setPositions] = useState(null)
    const [tokens, setTokens] = useState(null)

    const [fetchingPoolsError, setFetchingPoolsError] = useState(false)
    const [fetchingPoolsProccess, setFetchingPoolsProccess] = useState(true)

    const [fetchingPositionsError, setFetchingPositionsError] = useState(false)
    const [fetchingPositionsProccess, setFetchingPositionsProccess] = useState(true)

    const [fetchingTokensError, setFetchingTokensError] = useState(false)
    const [fetchingTokensProccess, setFetchingTokensProccess] = useState(true)

    const fetchPoolsData = async () => {
        const data = await fetchPools()
        try {
            setFetchingPoolsError(false)
            setPools(data.data.hedgePools)
            setFetchingPoolsProccess(false)
        } catch (error) {
            setFetchingPoolsProccess(false)
            setFetchingPoolsError(true)
            console.log('Error fetching data: ', error)
        }
    }

    const fetchPositionsData = async (account) => {
        const data = await fetchPositions(account)
        try {
            setFetchingPositionsError(false)
            setPositions(data.data.positions)
            setFetchingPositionsProccess(false)
        } catch (error) {
            setFetchingPositionsProccess(false)
            setFetchingPositionsError(true)
            console.log('Error fetching data: ', error)
        }
    }

    const fetchTokensData = async (id) => {
        const data = await fetchTokens(id)
        try {
            setFetchingTokensError(false)
            setTokens(data.data.tokens)
            setFetchingTokensProccess(false)
        } catch (error) {
            setFetchingTokensProccess(false)
            setFetchingTokensError(true)
            console.log('Error fetching data: ', error)
        }
    }


    useEffect(() => {
        if (account) {
            setFetchingPositionsProccess(true)
            fetchPositionsData(account)
        }
    })

    useEffect(() => {
        if (id) {
            setFetchingTokensProccess(true)
            fetchTokensData(id)
        }
    })

    useEffect(() => {
        setFetchingPoolsProccess(true)
        fetchPoolsData()
    })


    useEffect(() => {
        if (coins != null && positions != null && account) {
            const newPositions = positions.map((positions, index) => {
                const outCoinMeta = coins.find(coin => coin.id.toLowerCase() === positions.outToken.id.toLowerCase())
                const inCoinMeta = coins.find(coin => coin.id.toLowerCase() === positions.inToken.id.toLowerCase())
                return { ...positions, outCoinMeta, inCoinMeta, idForSelect: index + 1 }
            })
            setPositions(newPositions)
        }

    }, [coins, positions, account])

    return (
        <FetchContext.Provider value={{
            pools,
            positions,
            tokens,
            fetchingPoolsError,
            fetchingPoolsProccess,
            fetchingPositionsError,
            fetchingPositionsProccess,
            fetchingTokensError,
            fetchingTokensProccess,
        }}>
            {props.children}
        </FetchContext.Provider>
    )
}