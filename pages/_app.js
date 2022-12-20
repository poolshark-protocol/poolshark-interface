import '../styles/globals.css'
import "@rainbow-me/rainbowkit/styles.css";
import { DAppProvider, Config, Goerli } from '@usedapp/core'
import { getDefaultProvider } from 'ethers'

const config = {
  readOnlyChainId: Goerli.chainId,
  readOnlyUrls: {
    [Goerli.chainId]: 'https://eth-goerli.gateway.pokt.network/v1/lb/06ded497f9f7c86ffb2e880f',
  },
}

function MyApp({ Component, pageProps }) {

  return (
    <DAppProvider config={config}>
      <Component {...pageProps} />
    </DAppProvider>
  );
}

export default MyApp
