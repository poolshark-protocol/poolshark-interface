import '../styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet, goerli } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';



const { chains, provider } = configureChains(
  [mainnet, goerli],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: `https://eth-${chain.name}.gateway.pokt.network/v1/lb/06ded497f9f7c86ffb2e880f`,
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
  uri: "https://api.thegraph.com/subgraphs/name/alphak3y/poolshark-hedge-pool",
})

function MyApp({ Component, pageProps }) {

  return (
  
    <WagmiConfig client={wagmiClient}>
       <RainbowKitProvider chains={chains}>
        <ApolloProvider client={apolloClient}>
          <Component {...pageProps} />
        </ApolloProvider>
        </RainbowKitProvider>
    </WagmiConfig>
    
  );
}

export default MyApp
