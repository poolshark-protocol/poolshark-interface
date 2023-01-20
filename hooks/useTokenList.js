import { useState, createContext, useEffect, useContext } from 'react'
import axios from 'axios'
import {chainIdsToNamesForGitTokenList} from '../utils/chains'
import { useAccount, useProvider } from 'wagmi'


export default function useTokenList() {
  const [coins, setCoins] = useState([])
  const [firstToken, setFirstToken] = useState(null)
  const [secondToken, setSecondToken] = useState(null)
  const [firstTokenVal, setFirstTokenVal] = useState("")
  const [secondTokenVal, setSecondTokenVal] = useState("")

  const { account } = useAccount()
  const {
    network: { chainId }, chainId: chainIdFromProvider
  } = useProvider();

  useEffect(() => {
    const fetch = async () => {
      const chainName = chainIdsToNamesForGitTokenList[chainId]
      axios.get(`https://raw.githubusercontent.com/poolsharks-protocol/token-metadata/master/blockchains/${chainName === undefined ? "ethereum":chainName}/tokenlist.json`)
        .then(function (response) {
          setCoins(null)
          setCoins(response.data.listed_tokens)
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        })
      }
    fetch()  
  }, [chainId, account]);

  useEffect(() => {
      setFirstToken(null)
      setSecondToken(null)
  }, [chainId]);

  return [
    coins, 
    firstToken, 
    secondToken, 
    firstTokenVal, 
    secondTokenVal, 
    setCoins, 
    setFirstToken, 
    setSecondToken, 
    setFirstTokenVal, 
    setSecondTokenVal
  ]
}

