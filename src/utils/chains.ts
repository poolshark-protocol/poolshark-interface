import { ZERO_ADDRESS } from "./math/constants";
import { Chain } from "wagmi";
import { Network } from "alchemy-sdk";

export const scroll: Chain = {
  id: 534352,
  name: "Scroll Mainnet",
  network: "scroll",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [
        "https://chaotic-cosmopolitan-replica.scroll-mainnet.quiknode.pro/8ef882241d10f392fcbb1b1b051cd8cda1eaacf9/",
      ],
    },
    public: {
      http: [
        "https://chaotic-cosmopolitan-replica.scroll-mainnet.quiknode.pro/8ef882241d10f392fcbb1b1b051cd8cda1eaacf9/",
      ],
    },
  },
};

export const mode: Chain = {
  id: 34443,
  name: "Mode Network",
  network: "mode",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [
        "https://mainnet.mode.network",
      ],
    },
    public: {
      http: [
        "https://mainnet.mode.network",
      ],
    },
  },
};

export const arbitrumSepolia: Chain = {
  id: 421614,
  name: "Arbitrum Sepolia",
  network: "arbitrumSepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [
        "https://arbitrum-sepolia.core.chainstack.com/a0fd1794b40136e3d035e89ecbeca764",
      ],
    },
    public: {
      http: [
        "https://arbitrum-sepolia.core.chainstack.com/a0fd1794b40136e3d035e89ecbeca764",
      ],
    },
  },
};

export const defaultNetwork = "arbitrum-one";

export const chainIdsToNames = {
  421614: "arbitrum-sepolia",
  42161: "arbitrum-one",
  534352: "scroll",
  34443: "mode",
};

export const supportedChainIds = {
  421614: "arbitrumSepolia",
  42161: "arbitrum",
  534352: "scroll",
  34443: "mode",
};

export const supportedNetworkNames = {
  arbitrumSepolia: "arbitrum-sepolia",
  arbitrum: "arbitrum-one",
  scroll: "scroll",
  mode: "mode",
};

export const chainIdToRpc = {
  42161:
    "https://patient-distinguished-pallet.arbitrum-mainnet.quiknode.pro/4cbe7cbdb55ec4b33fdc1a4239e1169b167ae351/",
  421614:
    "https://arbitrum-sepolia.core.chainstack.com/a0fd1794b40136e3d035e89ecbeca764",
  534352:
    "https://chaotic-cosmopolitan-replica.scroll-mainnet.quiknode.pro/8ef882241d10f392fcbb1b1b051cd8cda1eaacf9/",
  34443:
    "https://mainnet.mode.network",
};

export const alchemyNetworks = {
	42161: Network.ARB_MAINNET,
	421614: Network.ARB_SEPOLIA,
}

export const chainProperties = {
  "arbitrum-sepolia": {
    chainName: "Arbitrum Sepolia Test Network",
		sdkSupport: {
			alchemy: false,
			swing: false
    },
    explorerUrl: "https://sepolia.arbiscan.io",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    wethAddress: "0x414b73f989e7ca0653b5c98186749a348405e6d5" as `0x${string}`,
    daiAddress: "0x9f479560cd8a531e6c0fe04521cb246264fe6b71" as `0x${string}`,
    finAddress: "0xcd453b942f35adf0364d89c05a892518825c1c3b",
    routerAddress:
      "0x73ac9a2e665925719d9c272a3df60b97dbc3e50d" as `0x${string}`,
    rangeStakerAddress:
      "0x62e0671022af1b2e705f08b282767c57d29c7c4c" as `0x${string}`,
    coverPoolFactory:
      "0x5c032AEC3a62AEC6a337D5f2aaA94905ecCBF06B" as `0x${string}`,
    coverSubgraphUrl:
      "",
    limitSubgraphUrl:
      "https://arbitrum-goerli.graph-eu.p2pify.com/871e9ed9089def9ec3ed8b54d340e36e/limit-arbitrum-sepolia",
  },
  "arbitrum-one": {
    sdkSupport: {
			alchemy: true,
			swing: true
    },
    chainName: "Arbitrum One",
    explorerUrl: "https://arbiscan.io",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    wethAddress: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1" as `0x${string}`,
    daiAddress: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1" as `0x${string}`,
    routerAddress:
      "0x12b7a6dd3a3dfde6a0f112a1bd876f704d933915" as `0x${string}`,
    rangeStakerAddress:
      "0x0e2b069fa52064a7e0b5a044ba25142203210a13" as `0x${string}`,
    coverPoolFactory: ZERO_ADDRESS as `0x${string}`,
    coverSubgraphUrl:
      "",
    limitSubgraphUrl:
      "https://arbitrum-mainnet.graph-eu.p2pify.com/27c3c2867e193dcf17ca262f64efe2a4/limit-arbitrum-redeploy",
    bondProtocol: {
      auctioneerAddress: "0xf7f9a96cdbfefd70bda14a8f30ec503b16bce9b1",
      tellerAddress: "0x007f7735baf391e207e3aa380bb53c4bd9a5fed6",
      vFinAddress: "0xFA3e62Aae5DE014c4CD20377Ec90Eb8e59d31169",
      wethAddress: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      bondTokenId:
        "50041069287616932026042816520963973508955622977186811114648766172172485699723",
      finAddress: "0x903ca00944d0b51e50d9f4fc96167c89f211542a", // FIN
      nullReferrer: "0x0000000000000000000000000000000000000000",
      marketSubgraphId: "42161_BondFixedTermFPA_120",
      marketId: 120,
      subgraphUrl:
        "https://api.thegraph.com/subgraphs/name/bond-protocol/bond-protocol-arbitrum-mainnet",
    },
  },
  "scroll": {
    chainName: "Scroll Mainnet",
		sdkSupport: {
			alchemy: false,
			swing: false
    },
    explorerUrl: "https://scrollscan.com",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    wethAddress: "0x5300000000000000000000000000000000000004" as `0x${string}`,
    daiAddress: "0xcA77eB3fEFe3725Dc33bccB54eDEFc3D9f764f97" as `0x${string}`,
    finAddress: "0x66864e3954dac74b9377ef25e4b47ca47423688e" as `0x${string}`,
    routerAddress:
      "0x895e1c476130ce9e1b19e01be8801f19122a958c" as `0x${string}`,
    rangeStakerAddress:
      "0xebf57cb31ed38e6ccb53fb71ba246ea549c42e51" as `0x${string}`,
    coverPoolFactory:
      ZERO_ADDRESS as `0x${string}`,
    coverSubgraphUrl:
      "",
    limitSubgraphUrl:
      "https://api.goldsky.com/api/public/project_clr6e38ix6mms01vddnnu2ydr/subgraphs/poolshark-limit-scroll/0.1.2/gn",
  },
  "mode": {
    chainName: "Mode Network",
		sdkSupport: {
			alchemy: false,
			swing: false
    },
    explorerUrl: "https://explorer.mode.network/",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    wethAddress: "0x4200000000000000000000000000000000000006" as `0x${string}`,
    daiAddress: "0xE7798f023fC62146e8Aa1b36Da45fb70855a77Ea" as `0x${string}`,
    finAddress: "0x66864e3954dac74b9377ef25e4b47ca47423688e" as `0x${string}`,
    routerAddress:
      "0x895e1c476130ce9e1b19e01be8801f19122a958c" as `0x${string}`,
    rangeStakerAddress:
      "0xebf57cb31ed38e6ccb53fb71ba246ea549c42e51" as `0x${string}`,
    coverPoolFactory:
      ZERO_ADDRESS as `0x${string}`,
    coverSubgraphUrl:
      "",
    limitSubgraphUrl:
      "https://api.goldsky.com/api/public/project_clr6e38ix6mms01vddnnu2ydr/subgraphs/poolshark-limit-scroll/0.1.2/gn",
  },
};
