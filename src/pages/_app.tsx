import '../styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, useProvider, WagmiConfig } from 'wagmi';
import { arbitrumGoerli } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ConnectWalletButton } from '../components/Buttons/ConnectWalletButton';
import { isMobile } from "react-device-detect";
import { Analytics } from '@vercel/analytics/react'
import { useConfigStore } from '../hooks/useConfigStore';


const { chains, provider } = configureChains(
  [arbitrumGoerli],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: `https://red-dawn-sailboat.arbitrum-goerli.quiknode.pro/560eae745e6413070c559ecee53af45f5255414b/`,
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
  uri: "https://arbitrum-goerli.graph-eu.p2pify.com/e1fce33d6c91a225a19e134ec9eeff22/staging-cover-arbitrumGoerli",
})

const whitelist = [
  '0x65f5B282E024e3d6CaAD112e848dEc3317dB0902',
  '0x1DcF623EDf118E4B21b4C5Dc263bb735E170F9B8',
  '0x9dA9409D17DeA285B078af06206941C049F692Dc',
  '0xBd5db4c7D55C086107f4e9D17c4c34395D1B1E1E'
]

function MyApp({ Component, pageProps }) {

  const [whitelisted, setWhitelisted] = useState(false)
  const { address, isDisconnected, isConnected } = useAccount()

  const [_isConnected, _setIsConnected] = useState(false);
  const [_isMobile, _setIsMobile] = useState(false);

  const [
    setChainId
  ] = useConfigStore((state) => [
    state.setChainId,
  ]);

  const {
    network: { chainId },
  } = useProvider();

  useEffect(() => {
    setChainId(chainId)
  }, [chainId]);

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
        <RainbowKitProvider chains={chains} initialChain={arbitrumGoerli}>
          <ApolloProvider client={apolloClient}>
            <>
            { _isConnected ? (whitelist.includes(address) ? (
              <div className="font-Jetbrains"><Component  {...pageProps} /></div>
            )
            : 
            <div className="min-h-screen flex items-center justify-center px-5 font-Jetbrains">
            <div className="md:max-w-lg">
                <img src="/static/images/logo.png" className="mx-auto mb-10 w-56" />
                <div className="text-white text-center mb-10 text-sm">
                Poolshark is currently under a closed testnet beta. You must be whitelisted in order to access the platform.  <a href="https://27m2bjslfwm.typeform.com/to/mJZBpT2x" className="text-main2 underline flex items-center justify-center mt-4 gap-x-2">Click here to join the waitlist<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg></a>
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
            (<div className="min-h-screen flex items-center justify-center px-5 font-Jetbrains">
              <div className="md:max-w-lg ">
                <img src="/static/images/logo.png" className="mx-auto mb-10 w-60" />
                <div className="text-white text-center mb-10 text-sm">
                Poolshark is currently under a closed testnet beta. You must be whitelisted in order to access the platform. <a href="https://27m2bjslfwm.typeform.com/to/mJZBpT2x" className="text-main2 underline flex items-center justify-center mt-4 gap-x-2">Click here to join the waitlist<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
</svg>
</a>
                </div>
                <div className="mx-10">
                <ConnectWalletButton/>
                </div>
                </div>
            </div>) }
            </>
            <Analytics />
          </ApolloProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  );
}

export default MyApp
