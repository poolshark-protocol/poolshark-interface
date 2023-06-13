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
import { useState, useEffect, Fragment } from 'react'
import { useAccount } from 'wagmi'
import { ConnectWalletButton } from '../components/Buttons/ConnectWalletButton';


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


const whitelist = [
  '0xCda329d290B6E7Cf8B9B1e4faAA48Da80B6Fa2F2',
]




function MyApp({ Component, pageProps }) {

  const [whitelisted, setWhitelisted] = useState(false)
  const { address, isDisconnected, isConnected } = useAccount()

  const [_isConnected, _setIsConnected] = useState(false);

  useEffect(() => {
    _setIsConnected(isConnected);
  }, [isConnected]);

  return (
    <>
    <Head>
       <title>Poolshark</title>
    </Head>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains} initialChain={arbitrumGoerli}>
          <ApolloProvider client={apolloClient}>
            { _isConnected ? (whitelist.includes(address) ? <Component {...pageProps} /> : 
            <div className="min-h-screen">
            <div className="max-w-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <img src="/static/images/logo.png" className="mx-auto mb-10 w-60" />
                <div className="text-white text-center text-lg mb-10 ">
                Poolshark is currently under a closed beta. You must be whitelisted in order to access the platform
                </div>
                <div className="mx-auto text-white text-center">
                <ConnectWalletButton center={true}/>
                <div className="mt-5 text-grey">
                This wallet is not whitelisted
                </div>
                </div>
                </div>
            </div>
          ) 
            : 
            (<div className="min-h-screen">
              <div className="max-w-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <img src="/static/images/logo.png" className="mx-auto mb-10 w-60" />
                <div className="text-white text-center text-lg mb-10 ">
                Poolshark is currently under a closed beta. You must be whitelisted in order to access the platform
                </div>
                <div className="mx-32">
                <ConnectWalletButton/>
                </div>
                </div>
            </div>) }
          </ApolloProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  );
}

export default MyApp
