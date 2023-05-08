import '../styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { arbitrumGoerli } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import Head from 'next/head'



const { chains, provider } = configureChains(
  [arbitrumGoerli],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: `https://arb-goerli.g.alchemy.com/v2/M8Dr_KQx46ghJ93XDQe7j778Qa92HRn2`,
      }),
    }),
  ],
);

const { connectors } = getDefaultWallets({
  appName: 'Poolshark UI',
  chains
});

const wagmiClient = createClient({
  connectors,
  provider,
  autoConnect: true
})

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://api.thegraph.com/subgraphs/name/alphak3y/poolshark-cover",
})

function MyApp({ Component, pageProps }) {

  return (
    <>
    <Head>
       <title>Poolshark</title>
    </Head>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains}>
          <ApolloProvider client={apolloClient}>
            <Component {...pageProps} />
          </ApolloProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  );
}

export default MyApp
