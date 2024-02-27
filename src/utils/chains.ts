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
  blockExplorers: {
    default: {
      name: "Scrollscan",
      url: "https://scrollscan.com/"
    }
  }
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
  blockExplorers: {
    default: {
      name: "Mode Explorer",
      url: "https://explorer.mode.network/"
    }
  }
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
  blockExplorers: {
    default: {
      name: "Sepolia Arbiscan",
      url: "https://sepolia.arbiscan.io/"
    }
  }
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
  "fin-token": {
    networkName: "arbitrum-one",
    tokenAddress: "0x903ca00944d0b51e50d9f4fc96167c89f211542a",
  },
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
      "0x86d7513c703767595a2b33f6379e2a7a591f3c6e" as `0x${string}`,
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
			alchemy: false,
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
      "0x56eb29a51d5a163b621fd8d6416f35f37811fbf0" as `0x${string}`,
    rangeStakerAddress:
      "0x0e2b069fa52064a7e0b5a044ba25142203210a13" as `0x${string}`,
    coverPoolFactory: ZERO_ADDRESS as `0x${string}`,
    coverSubgraphUrl:
      "",
    limitSubgraphUrl:
      "https://api.goldsky.com/api/public/project_clr6e38ix6mms01vddnnu2ydr/subgraphs/poolshark-limit-arbitrum-season0-block1/0.2.6/gn",
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
    whitelistedPools: [
      '0x7b47619045ae93f9311d0562a43c244c42bfe485' // FIN-WETH 0.3%
    ],
    whitelistedPairs: [
      '0x82af49447d8a07e3bd95bd0d56f35241523fbab1-0x903ca00944d0b51e50d9f4fc96167c89f211542a-0.3%',
    ],
    season0Rewards: {
      block1: {
        whitelistedFeesUsd: 40000
      }
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
      "0xf04bf4e3e8157ba5b91bfda16e21be770e7ac790" as `0x${string}`,
    rangeStakerAddress:
      "0xebf57cb31ed38e6ccb53fb71ba246ea549c42e51" as `0x${string}`,
    coverPoolFactory:
      ZERO_ADDRESS as `0x${string}`,
    coverSubgraphUrl:
      "",
    limitSubgraphUrl:
      "https://api.goldsky.com/api/public/project_clr6e38ix6mms01vddnnu2ydr/subgraphs/poolshark-limit-scroll/0.2.5/gn",
    whitelistedPools: [
      "0xb14917888ba92937be3d89094f83a62904ebc9dd", // ETH-USDT 0.1%
    ],
    whitelistedPairs: [
      '0x5300000000000000000000000000000000000004-0xf55bec9cafdbe8730f096aa55dad6d22d44099df-0.1%',
    ],
    season0Rewards: {
      block1: {
        whitelistedFeesUsd: 20000
      }
    },
  },
  "mode": {
    chainName: "Mode Network",
		sdkSupport: {
			alchemy: false,
			swing: false
    },
    explorerUrl: "https://modescan.io",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    wethAddress: "0x4200000000000000000000000000000000000006" as `0x${string}`,
    daiAddress: "0xE7798f023fC62146e8Aa1b36Da45fb70855a77Ea" as `0x${string}`,
    finAddress: "0x66864e3954daC74b9377Ef25E4B47Ca47423688E" as `0x${string}`,
    routerAddress:
      "0x54f66fb1b1776670a512b6a9e61a94e6c2dcd512" as `0x${string}`,
    rangeStakerAddress:
      "0x58d8235108e12e6b725a53b57cd0b00c5edee0da" as `0x${string}`,
    coverPoolFactory:
      ZERO_ADDRESS as `0x${string}`,
    coverSubgraphUrl:
      "",
    limitSubgraphUrl:
      "https://api.goldsky.com/api/public/project_clr6e38ix6mms01vddnnu2ydr/subgraphs/poolshark-limit-mode/0.2.5/gn",
    whitelistedPools: [
      '0xfc16003afdff37580c9de7deeeb87f9c65b6908a', // WETH-USDT 0.1%
      '0xc20b141edd79f912897651eba9a2bca6b17dc7f1', // WETH-USDC 0.1%
      '0x7efec766f18d4b79abf5b550bfe59a1bffb37d95' // USDC-USDT 0.1%
    ],
    whitelistedPairs: [
      '0x4200000000000000000000000000000000000006-0xf0f161fda2712db8b566946122a5af183995e2ed-0.1%',
      '0xd988097fb8612cc24eec14542bc03424c656005f-0xf0f161fda2712db8b566946122a5af183995e2ed-0.1%',
      '0x4200000000000000000000000000000000000006-0xd988097fb8612cc24eec14542bc03424c656005f-0.1%',
    ],
    usdStables: [
      '0xd988097fb8612cc24eec14542bc03424c656005f', // USDC
      '0xf0f161fda2712db8b566946122a5af183995e2ed', // USDT
      '0xe7798f023fc62146e8aa1b36da45fb70855a77ea', // DAI
    ],
    stablePools: [
      '0x7efec766f18d4b79abf5b550bfe59a1bffb37d95' // USDC-USDT 0.1%
    ],
    season0Rewards: {
      block1: {
        whitelistedFeesUsd: 60000
      }
    },
  },
};
