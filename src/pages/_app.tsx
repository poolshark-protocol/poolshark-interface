import Head from "next/head";
// import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Toaster } from "sonner";

import { chainProperties } from "../utils/chains";
import Safary from "../components/script";
import WalletProviders from "../components/WalletProviders";
import ConfigWrapper from "../components/ConfigWrapper";

import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";

export const saleConfig = chainProperties["fin-token"]["sale"];

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>Poolshark</title>
      </Head>
      <Safary />
      <Toaster richColors theme="dark" />
      <WalletProviders>
        {/* <ApolloProvider client={apolloClient}> */}
        <ConfigWrapper>
          <Component {...pageProps} />
        </ConfigWrapper>
        <SpeedInsights />
        {/* <Analytics /> </ApolloProvider> */}
      </WalletProviders>
    </>
  );
}

export default MyApp;
