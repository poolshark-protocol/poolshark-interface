import { ZERO_ADDRESS } from "./math/constants";
import { Chain } from "wagmi";

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
  1: "ethereum",
  5: "goerli",
  421613: "arbitrum-goerli",
  421614: "arbitrum-sepolia",
  42161: "arbitrum-one",
};

export const decToHex = {
  1: "0x1",
  5: "0x5",
  421613: "0x66EED",
  421614: "0x66EEE",
  42161: "0xA4B1",
};

export const supportedChainIds = {
  1: "mainnet",
  5: "goerli",
  421613: "arbitrumGoerli",
  421614: "arbitrumSepolia",
  42161: "arbitrum",
};

export const supportedNetworkNames = {
  arbitrumSepolia: "arbitrum-sepolia",
  arbitrum: "arbitrum-one",
};

export const chainProperties = {
  mainnet: {
    chainName: "Ethereum Mainnet",
    logo: "https://raw.githubusercontent.com/poolsharks-protocol/token-metadata/stake-range/blockchains/ethereum/logo.png",
    rpcUrls: ["https://eth-mainnet.public.blastapi.io"],
    blockExplorerUrls: ["https://etherscan.io/"],
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    chainId: "0x1",
    routerAddress: ZERO_ADDRESS as `0x${string}`,
  },
  goerli: {
    chainName: "Goerli Test Network",
    logo: "https://assets.trustwalletapp.com/blockchains/polygon/assets/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/logo.png",
    rpcUrls: ["https://goerli.infura.io/v3/"],
    blockExplorerUrls: ["https://goerli.etherscan.io/"],
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    chainId: "0x5",
    routerAddress: ZERO_ADDRESS as `0x${string}`,
  },
  "arbitrum-sepolia": {
    chainName: "Arbitrum Sepolia Test Network",
    logo: "https://assets.trustwalletapp.com/blockchains/polygon/assets/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/logo.png",
    rpcUrls: [
      "https://arbitrum-sepolia.core.chainstack.com/a0fd1794b40136e3d035e89ecbeca764",
    ],
    explorerUrl: "https://sepolia.arbiscan.io/",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    chainId: "0x66EEE",
    wethAddress: "0x414b73f989e7ca0653b5c98186749a348405e6d5" as `0x${string}`,
    daiAddress: "0x9f479560cd8a531e6c0fe04521cb246264fe6b71" as `0x${string}`,
    finAddress: "0xcd453b942f35adf0364d89c05a892518825c1c3b",
    routerAddress:
      "0x33df95efe07a3b3e69ba31438ae511d360d89b32" as `0x${string}`,
    rangeStakerAddress:
      "0x62e0671022af1b2e705f08b282767c57d29c7c4c" as `0x${string}`,
    coverPoolFactory:
      "0x5c032AEC3a62AEC6a337D5f2aaA94905ecCBF06B" as `0x${string}`,
    coverSubgraphUrl:
      "https://arbitrum-goerli.graph-eu.p2pify.com/e1fce33d6c91a225a19e134ec9eeff22/staging-cover-arbitrumGoerli",
    limitSubgraphUrl:
      "https://arbitrum-goerli.graph-eu.p2pify.com/871e9ed9089def9ec3ed8b54d340e36e/limit-arbitrum-sepolia",
  },
  'arbitrum-one': {
    chainName: "Arbitrum One",
    logo: "https://raw.githubusercontent.com/poolshark-protocol/token-metadata/master/blockchains/arbitrum-one/logo.png",
    rpcUrls: [
      "https://patient-distinguished-pallet.arbitrum-mainnet.quiknode.pro/4cbe7cbdb55ec4b33fdc1a4239e1169b167ae351/",
    ],
    explorerUrl: "https://arbiscan.io/",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    chainId: "0xA4B1",
    wethAddress: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1" as `0x${string}`,
    daiAddress: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1" as `0x${string}`,
    routerAddress:
      "0x12b7a6dd3a3dfde6a0f112a1bd876f704d933915" as `0x${string}`,
    rangeStakerAddress:
      "0x0e2b069fa52064a7e0b5a044ba25142203210a13" as `0x${string}`,
    coverPoolFactory: ZERO_ADDRESS as `0x${string}`,
    coverSubgraphUrl:
      "https://arbitrum-goerli.graph-eu.p2pify.com/e1fce33d6c91a225a19e134ec9eeff22/staging-cover-arbitrumGoerli",
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
};
