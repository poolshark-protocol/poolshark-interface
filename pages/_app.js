import '../styles/globals.css'
import "@rainbow-me/rainbowkit/styles.css";
import { DAppProvider, Config, Goerli } from '@usedapp/core'
import { getDefaultProvider } from 'ethers'

const config = {
  readOnlyChainId: Goerli.chainId,
  readOnlyUrls: {
    [Goerli.chainId]: getDefaultProvider('goerli'),
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
