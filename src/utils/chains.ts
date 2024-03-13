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

export const injectiveEvm: Chain = {
  id: 2525,
  name: "Injective EVM",
  network: "injective-evm",
  nativeCurrency: {
    decimals: 18,
    name: "Injective",
    symbol: "INJ",
  },
  rpcUrls: {
    default: {
      http: [
        "https://inevm.calderachain.xyz/http",
      ],
    },
    public: {
      http: [
        "https://inevm.calderachain.xyz/http",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "inEVM Caldera Explorer",
      url: "https://inevm.calderaexplorer.xyz/"
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
  2525: "injective-evm",
};

export const chainIdsToFullNames = {
  421614: "Arbitrum Sepolia",
  42161: "arbitrum-one",
  534352: "scroll",
  34443: "mode",
  2525: "injective-evm",
};

export const supportedChainIds = {
  421614: "arbitrumSepolia",
  42161: "arbitrum",
  534352: "scroll",
  34443: "mode",
  2525: "injective-evm",
};

export const supportedNetworkNames = {
  arbitrumSepolia: "arbitrum-sepolia",
  arbitrum: "arbitrum-one",
  scroll: "scroll",
  mode: "mode",
  ["injective-evm"]: "injective-evm"
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
  2525:
    "https://inevm.calderachain.xyz/http",
};

export const alchemyNetworks = {
	42161: Network.ARB_MAINNET,
	421614: Network.ARB_SEPOLIA,
}

export const chainProperties = {
  "fin-token": {
    networkName: "arbitrum-one",
    tokenAddress: "0x903ca00944d0b51e50d9f4fc96167c89f211542a",
    sale: {
      chainId: 421614,
      networkName: "arbitrum-sepolia",
      wethAddress: "0x414b73f989e7ca0653b5c98186749a348405e6d5",
      finAddress: "0xbfc8300da2cf7d487690267f5867c7fc0f8c2b20",
      explorerUrl: "https://sepolia.arbiscan.io/address/0xbfc8300da2cf7d487690267f5867c7fc0f8c2b20",
      poolAddress: "0x7c85696ee5bc7253d401f97a30093c851a5fbadc",
      ownerAddress: "0xBd5db4c7D55C086107f4e9D17c4c34395D1B1E1E",
      limitPositionId: 3,
      finIsToken0: false,
      limitLP: {
        lower: 66330,
        upper: 71460,
        liquidity: 124103332944179176980774,
      },
    }
  },
  "arbitrum-sepolia": {
    chainName: "Arbitrum Sepolia",
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
    finAddress: "0x85972e3a58a4b03cc3c36e8a05e4ca5c16f92068",
    routerAddress:
      "0xa801ca07b20ef56251739d9b3197bfd02cfa20e8" as `0x${string}`,
    rangeStakerAddress:
      "0x62e0671022af1b2e705f08b282767c57d29c7c4c" as `0x${string}`,
    coverPoolFactory:
      ZERO_ADDRESS as `0x${string}`,
    coverSubgraphUrl:
      "",
    limitSubgraphUrl:
      "https://api.goldsky.com/api/public/project_clr6e38ix6mms01vddnnu2ydr/subgraphs/poolshark-limit-arb-sepolia-season0-block2/0.2.9/gn",
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
      "https://api.goldsky.com/api/public/project_clr6e38ix6mms01vddnnu2ydr/subgraphs/poolshark-limit-arbitrum-season0-block2/0.3.0/gn",
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
      },
      block2: {
        whitelistedFeesUsd: 10000
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
      "https://api.goldsky.com/api/public/project_clr6e38ix6mms01vddnnu2ydr/subgraphs/poolshark-limit-scroll-season0-block2/0.3.0/gn",
    whitelistedPools: [
      "0xb14917888ba92937be3d89094f83a62904ebc9dd", // ETH-USDT 0.1%
    ],
    whitelistedPairs: [
      '0x5300000000000000000000000000000000000004-0xf55bec9cafdbe8730f096aa55dad6d22d44099df-0.1%',
    ],
    season0Rewards: {
      block1: {
        whitelistedFeesUsd: 20000
      },
      block2: {
        whitelistedFeesUsd: 5000
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
      "https://api.goldsky.com/api/public/project_clr6e38ix6mms01vddnnu2ydr/subgraphs/poolshark-limit-mode-season0-block2/0.3.0/gn",
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
      },
      block2: {
        whitelistedFeesUsd: 100000
      }
    },
  },
  "injective-evm": {
    chainName: "Injective EVM",
		sdkSupport: {
			alchemy: false,
			swing: false
    },
    explorerUrl: "https://explorer.inevm.com",
    nativeCurrency: {
      name: "INJ",
      symbol: "INJ",
      decimals: 18,
    },
    wethAddress: "0x69011706b3f6c6eaed7d2bc13801558b4fd94cbf" as `0x${string}`,
    daiAddress: "0x8358d8291e3bedb04804975eea0fe9fe0fafb147" as `0x${string}`,
    finAddress: "0x66864e3954daC74b9377Ef25E4B47Ca47423688E" as `0x${string}`,
    routerAddress:
      "0x125D13B5245127b97d44Ac2F7b819763e2A190be" as `0x${string}`,
    rangeStakerAddress:
      "0xde95e92dd151c39eb51cfae80fdff4d6c32c1fad" as `0x${string}`,
    coverPoolFactory:
      ZERO_ADDRESS as `0x${string}`,
    coverSubgraphUrl:
      "",
    limitSubgraphUrl:
      "https://api.goldsky.com/api/public/project_clr6e38ix6mms01vddnnu2ydr/subgraphs/poolshark-limit-inevm-season0-block1/0.2.9/gn",
    whitelistedPools: [
    ],
    whitelistedPairs: [
    ],
    usdStables: [
      '0x8358d8291e3bedb04804975eea0fe9fe0fafb147', // USDC
      '0x97423a68bae94b5de52d767a17abcc54c157c0e5'  // USDT
    ],
    stablePools: [
      '0x00a5a1f32231040e998b56b158bcb1933fa73ee8' // USDC-USDT 0.1%
    ],
    season0Rewards: {
      block1: {
        whitelistedFeesUsd: 0
      },
      block2: {
        whitelistedFeesUsd: 5000
      }
    },
  },
};
