import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import Script from "next/script";
import {
  configureChains,
  createConfig,
  WagmiConfig,
} from "wagmi";
import { arbitrum } from "wagmi/chains";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import Head from "next/head";
// import { Analytics } from "@vercel/analytics/react";
import {
  arbitrumSepolia,
  chainIdToRpc,
  scroll,
  mode,
} from "../utils/chains";

import { SpeedInsights } from "@vercel/speed-insights/react";

import Safary from "../components/script";
import { Toaster } from "sonner";
import ConfigWrapper from "../components/ConfigWrapper";

const { chains, publicClient } = configureChains(
  [mode, arbitrum, scroll, arbitrumSepolia],
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
  // projectId: '5a973f41c4770ff68f712ffca44a6526'
  projectId: '4c0830341026abc0916819b69728a141'
});

// Wagmi
const wagmiClient = createConfig({
  connectors,
  publicClient,
  autoConnect: true,
});

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>Poolshark</title>
      </Head>
      <Safary />
      <Toaster richColors theme="dark" />
      <WagmiConfig config={wagmiClient}>
        <RainbowKitProvider chains={chains} initialChain={mode}>
          {/* <ApolloProvider client={apolloClient}> */}
          <ConfigWrapper>
            <Component {...pageProps} />
          </ConfigWrapper>
          <SpeedInsights />
          {/* <Analytics /> </ApolloProvider> */}
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  );
}

export default MyApp;
