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
  chainProperties,
  supportedNetworkNames,
  arbitrumSepolia,
  chainIdToRpc,
  scroll,
} from "../utils/chains";
import TermsOfService from "../components/Modals/ToS";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useTradeStore } from "../hooks/useTradeStore";
import { useRangeLimitStore } from "../hooks/useRangeLimitStore";
import { fetchListedTokenBalances, fetchTokenMetadata } from "../utils/tokens";

const { chains, provider } = configureChains(
  [arbitrum, arbitrumSepolia, scroll],
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

function MyApp({ Component, pageProps }) {
  const [isLoading, setIsLoading] = useState(true);
  const { address, isConnected } = useAccount();

  const [_isConnected, _setIsConnected] = useState(false);
  const [_isMobile, _setIsMobile] = useState(false);

  const [walletConnected, setWalletConnected] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);

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
    listed_tokens,
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
    state.listedtokenList,
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

  const [resetTradeLimitParams] = useTradeStore((state) => [
    state.resetTradeLimitParams,
  ]);

  const [resetLimitStore] = useRangeLimitStore((state) => [
    state.resetRangeLimitParams,
  ]);

  const {
    network: { chainId, name },
  } = useProvider();

  useEffect(() => {
    setChainId(chainId);
  }, [chainId]);

  useEffect(() => {
    if (listed_tokens && address) {
      fetchListedTokenBalances(
        chainId,
        address,
        listed_tokens,
        search_tokens
      ).then();
    }
  }, [listed_tokens, address]);

  useEffect(() => {
    resetTradeLimitParams(chainId);
    resetLimitStore(chainId);
    fetchTokenMetadata(
      chainId,
      setListedTokenList,
      setDisplayTokenList,
      setSearchTokenList,
      setIsLoading
    );
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
