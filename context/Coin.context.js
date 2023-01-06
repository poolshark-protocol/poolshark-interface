import { useState, createContext, useEffect, useContext } from 'react'
import axios from 'axios'
import { useEthers } from '@usedapp/core';
import {chainIdsToNamesForGitTokenList} from '../utils/chains'

export const CoinContext = createContext()

export const CoinProvider = (props) => {
  const [coins, setCoins] = useState(null)
  const [usdcToken, setUsdcToken] = useState()
  const [firstToken, setFirstToken] = useState(null)
  const [secondToken, setSecondToken] = useState(null)
  const [firstTokenVal, setFirstTokenVal] = useState("")
  const [secondTokenVal, setSecondTokenVal] = useState("")

  useEffect(async () => {
    const fetch = async () => {
      const chainName = chainIdsToNamesForGitTokenList[5]
      axios.get(`https://raw.githubusercontent.com/poolsharks-protocol/token-metadata/master/blockchains/${chainName === undefined ? "ethereum":chainName}/tokenlist.json`)
        .then(function (response) {
          setCoins(null)
          setCoins(response.data.search_tokens)
          setUsdcToken(response.data.search_tokens.find(coin => coin.symbol === 'USDC'))
  
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        })
      }

      await fetch()
    
  });

  useEffect( () => {
      setFirstToken(null)
      setSecondToken(null)
  });


  return (
    <CoinContext.Provider value={{
      secondTokenVal, setSecondTokenVal, firstTokenVal, setFirstTokenVal,
      coins, usdcToken, firstToken, setFirstToken, secondToken, setSecondToken
    }}>
      {props.children}
    </CoinContext.Provider>
  )
}

