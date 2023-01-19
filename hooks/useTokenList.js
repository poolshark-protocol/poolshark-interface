import { useState, createContext, useEffect, useContext } from 'react'
import axios from 'axios'
import {chainIdsToNamesForGitTokenList} from '../utils/chains'
import { chain } from 'wagmi'


export default function useTokenList() {
  const [coins, setCoins] = useState(null)
  const [firstToken, setFirstToken] = useState(null)
  const [secondToken, setSecondToken] = useState(null)
  const [firstTokenVal, setFirstTokenVal] = useState("")
  const [secondTokenVal, setSecondTokenVal] = useState("")

  console.log(chain)
  useEffect(async () => {
    const fetch = async () => {
      const chainName = chainIdsToNamesForGitTokenList[5]
      axios.get(`https://raw.githubusercontent.com/poolsharks-protocol/token-metadata/master/blockchains/${chainName === undefined ? "ethereum":chainName}/tokenlist.json`)
        .then(function (response) {
          setCoins(null)
          setCoins(response.data.search_tokens)
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        })
      }

      await fetch()
    
  }, [chain, account]);

  useEffect( () => {
      setFirstToken(null)
      setSecondToken(null)
  }, [chain]);


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
    setSecondTokenVal]
}

