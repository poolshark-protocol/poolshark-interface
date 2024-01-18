import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, useProvider, WagmiConfig } from "wagmi";
import { arbitrum } from "wagmi/chains";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { isMobile } from "react-device-detect";
// import { Analytics } from "@vercel/analytics/react";
import { useConfigStore } from "../hooks/useConfigStore";
import {
  chainIdsToNames,
  chainProperties,
  supportedNetworkNames,
  arbitrumSepolia,
  chainIdToRpc,
  alchemyNetworks,
} from "../utils/chains";
import axios from "axios";
import { coinsList } from "../utils/types";
import { useRouter } from "next/router";
import TermsOfService from "../components/Modals/ToS";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Alchemy, Network } from "alchemy-sdk";

const { chains, provider } = configureChains(
  [arbitrum, arbitrumSepolia],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: chainIdToRpc[chain.id],
      }),
    }),
  ]
);

// Rainbow Kit
const { connectors } = getDefaultWallets({
  appName: "Poolshark UI",
  chains,
});

// Wagmi
const wagmiClient = createClient({
  connectors,
  provider,
  autoConnect: true,
});

const whitelist = [
  "0x65f5B282E024e3d6CaAD112e848dEc3317dB0902",
  "0x1DcF623EDf118E4B21b4C5Dc263bb735E170F9B8",
  "0x9dA9409D17DeA285B078af06206941C049F692Dc",
  "0xBd5db4c7D55C086107f4e9D17c4c34395D1B1E1E",
  "0x73CE13ac285569738bc499ec711bDAa899725d37", // olamide
  "0xE48870dBBdC4abde7Ed8682254b9fb53270F79d2", // mrmasa
];

function MyApp({ Component, pageProps }) {
  const [isLoading, setIsLoading] = useState(true);
  const { address, isDisconnected, isConnected } = useAccount();

  const [_isConnected, _setIsConnected] = useState(false);
  const [_isMobile, _setIsMobile] = useState(false);

  const [walletConnected, setWalletConnected] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);

  const router = useRouter();

  const tokenMetadataBranch = "master";

  useEffect(() => {
    // Check if terms of service is accepted
    const isTosAccepted = localStorage.getItem("tosAccepted") === "true";
    setTosAccepted(isTosAccepted);

    // Simulate wallet connection logic
    // In real scenario, this will be replaced with actual wallet connection logic
    // setWalletConnected(true/false) based on wallet connection status
  }, []);

  const handleTosAccept = () => {
    localStorage.setItem("tosAccepted", "true");
    setTosAccepted(true);
  };

  const [
    networkName,
    search_tokens,
    setChainId,
    setNetworkName,
    setLimitSubgraph,
    setCoverSubgraph,
    setCoverFactoryAddress,
    setListedTokenList,
    setSearchTokenList,
    setDisplayTokenList,
  ] = useConfigStore((state) => [
    state.networkName,
    state.searchtokenList,
    state.setChainId,
    state.setNetworkName,
    state.setLimitSubgraph,
    state.setCoverSubgraph,
    state.setCoverFactoryAddress,
    state.setListedTokenList,
    state.setSearchTokenList,
    state.setDisplayTokenList,
  ]);

  const {
    network: { chainId, name },
  } = useProvider();

  useEffect(() => {
    setChainId(chainId);
  }, [chainId]);

  useEffect(() => {
    const config = {
      apiKey: "73s_R3kr7BizJjj4bYslsKBR9JH58cWI",
      network:
        alchemyNetworks[chainId] ?? Network.ARB_MAINNET,
    };

    const tokenAddresses = [];

    const fetchTokenBalances = async () => {
      const alchemy = new Alchemy(config);
      const data = await alchemy.core.getTokenBalances(address, tokenAddresses);
      if (data.tokenBalances.length != 0) {
        for (let i = 0; i < data.tokenBalances.length; i++) {
          if (search_tokens[i]?.balance) {
            search_tokens[i].balance = data.tokenBalances[i].tokenBalance;
          }
        }
        setSearchTokenList(search_tokens);
      }
      setTimeout(() => {
        fetchTokenBalances();
      }, 2500);
    };
    const fetchTokenMetadata = async () => {
      const chainName = chainIdsToNames[chainId];
      axios
        .get(
          `https://raw.githubusercontent.com/poolshark-protocol/token-metadata/` +
            tokenMetadataBranch +
            `/blockchains/${chainName ?? "arbitrum-one"}/tokenlist.json`
        )
        .then(function (response) {
          for (let i = 0; i < response.data.search_tokens.length; i++) {
            tokenAddresses.push(response.data.search_tokens[i].id);
          }
          const coins = {
            listed_tokens: response.data.listed_tokens,
            search_tokens: response.data.search_tokens,
          } as coinsList;
          for (let i = 0; i < coins.listed_tokens?.length; i++) {
            coins.listed_tokens[i].address = coins.listed_tokens[i].id;
          }
          if (coins.listed_tokens != undefined) {
            setListedTokenList(coins.listed_tokens);
            setDisplayTokenList(coins.listed_tokens);
          }
          for (let i = 0; i < coins.search_tokens?.length; i++) {
            coins.search_tokens[i].address = coins.search_tokens[i].id;
          }
          if (coins.search_tokens != undefined) {
            setSearchTokenList(coins.search_tokens);
          }
          setIsLoading(false);
        })
        .catch(function (error) {
          console.log(error);
        })
        .then(() => {
          if (!!search_tokens) {
            fetchTokenBalances();
          }
        });
    };
    fetchTokenMetadata();
  }, [chainId]);

  useEffect(() => {
    const networkName = supportedNetworkNames[name] ?? "unknownNetwork";
    const chainConstants = chainProperties[networkName]
      ? chainProperties[networkName]
      : chainProperties["arbitrum"];
    setLimitSubgraph(chainConstants["limitSubgraphUrl"]);
    setCoverSubgraph(chainConstants["coverSubgraphUrl"]);
    setCoverFactoryAddress(chainConstants["coverPoolFactory"]);
    setNetworkName(networkName);
  }, [name]);

  useEffect(() => {
    _setIsConnected(isConnected);
  }, [isConnected]);
  useEffect(() => {
    _setIsMobile(isMobile);
  }, [isMobile]);

  return (
    <>
      <Head>
        <title>Poolshark</title>
      </Head>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains} initialChain={arbitrum}>
          {/* <ApolloProvider client={apolloClient}> */}
          <>
            {_isConnected && !tosAccepted && (
              <TermsOfService
                setIsOpen={true}
                isOpen={true}
                onAccept={handleTosAccept}
              />
            )}
            {!isLoading ? (
              <div className="font-Jetbrains">
                <Component {...pageProps} />
              </div>
            ) : (
              <div className="h-screen w-screen flex justify-center items-center text-main2 flex-col gap-y-5">
                <svg
                  stroke="currentColor"
                  className="animate-spin"
                  fill="none"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  height="3em"
                  width="3em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg>
                <h1 className="text-white -mr-8">Loading...</h1>
              </div>
            )}
          </>
          <SpeedInsights />

          {/* <Analytics /> </ApolloProvider> */}
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  );
}

export default MyApp;
