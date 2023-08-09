import { useState, useEffect } from "react";
import axios from "axios";
import { coinsList } from "../utils/types";
import { chainIdsToNamesForGitTokenList } from "../utils/chains";
import { useAccount, useProvider } from "wagmi";

export default function useTokenList() {
  const [coins, setCoins] = useState({});

  const { address } = useAccount();
  const {
    network: { chainId },
  } = useProvider();

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
          setCoins(null);
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
