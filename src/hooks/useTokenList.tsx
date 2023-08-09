import { useState, useEffect } from "react";
import axios from "axios";
import { coinsList } from "../utils/types";
import { chainIdsToNamesForGitTokenList } from "../utils/chains";
import { useAccount, useBalance, useProvider } from "wagmi";

export default function useTokenList() {
  const { address } = useAccount();
  const {
    network: { chainId },
  } = useProvider();

  const [coins, setCoins] = useState({} as coinsList);

  useEffect(() => {
    updateBalances();
  }, [address, coins]);

  function updateBalances() {
    if (coins.listed_tokens) {
      const coinsAux = coins;
      coinsAux.listed_tokens.forEach((coin) => {
        coin.address = coin.id;
      });
      setCoins(coinsAux);
    }
  }

  useEffect(() => {
    const fetch = async () => {
      const chainName = chainIdsToNamesForGitTokenList[chainId];
      axios
        .get(
          `https://raw.githubusercontent.com/poolsharks-protocol/token-metadata/master/blockchains/${
            chainName === undefined ? "ethereum" : "arbitrum-goerli"
          }/tokenlist.json`
        )
        .then(function (response) {
          const coins = {
            listed_tokens: response.data.listed_tokens,
            search_tokens: response.data.search_tokens,
          } as coinsList;
          setCoins(coins);
        })
        .catch(function (error) {
          console.log(error);
        });
    };
    fetch();
  }, [chainId, address]);

  return coins;
}
