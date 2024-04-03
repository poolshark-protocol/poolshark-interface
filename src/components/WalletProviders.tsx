import { PropsWithChildren } from "react";
import {
  midnightTheme,
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { arbitrum } from "wagmi/chains";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

import {
  arbitrumSepolia,
  chainIdToRpc,
  scroll,
  mode,
  injectiveEvm,
} from "../utils/chains";

const { chains, publicClient } = configureChains(
  [mode, injectiveEvm, arbitrum, scroll, arbitrumSepolia],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: chainIdToRpc[chain.id],
      }),
    }),
  ],
);

// Rainbow Kit
const { connectors } = getDefaultWallets({
  appName: "Poolshark UI",
  chains,
  projectId: "5a973f41c4770ff68f712ffca44a6526",
});

// Wagmi
const wagmiClient = createConfig({
  connectors,
  publicClient,
  autoConnect: true,
});

const WalletProviders = ({ children }: PropsWithChildren) => {
  return (
    <WagmiConfig config={wagmiClient}>
      <RainbowKitProvider
        chains={chains}
        theme={midnightTheme({
          accentColor: "#0E76FD",
        })}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default WalletProviders;
