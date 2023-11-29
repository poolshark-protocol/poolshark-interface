import { ZERO_ADDRESS } from "./math/constants";

export const chainIdsToNamesForGitTokenList = {
    1: 'ethereum',
    5: 'goerli',
    421613: 'arbitrumGoerli'
};

export const decToHex = {
    1: '0x1',
    5: '0x5',
    421613: '0x66EED'
};

export const supportedChainIds = {
    1: 'mainnet',
    5: 'goerli',
    421613: 'arbitrumGoerli'
};

export const supportedNetworkNames = {
    'arbitrum-goerli': 'arbitrumGoerli'
};

export const chainProperties = {
    mainnet: {
        chainName: 'Ethereum Mainnet',
        logo:"https://raw.githubusercontent.com/poolsharks-protocol/token-metadata/stake-range/blockchains/ethereum/logo.png",
        rpcUrls: ['https://eth-mainnet.public.blastapi.io'],
        blockExplorerUrls: ['https://etherscan.io/'],
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
        },
        chainId: '0x1',
        routerAddress: ZERO_ADDRESS as `0x${string}`
    },
    goerli: {
        chainName: 'Goerli Test Network',
        logo:"https://assets.trustwalletapp.com/blockchains/polygon/assets/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/logo.png",
        rpcUrls: ['https://goerli.infura.io/v3/'],
        blockExplorerUrls: ['https://goerli.etherscan.io/'],
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
        },
        chainId: '0x5',
        routerAddress: ZERO_ADDRESS as `0x${string}`
    },
    arbitrumGoerli: {
        chainName: 'Arbitrum Goerli Test Network',
        logo:"https://assets.trustwalletapp.com/blockchains/polygon/assets/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/logo.png",
        rpcUrls: ['https://aged-serene-dawn.arbitrum-goerli.quiknode.pro/13983d933555da1c9977b6c1eb036554b6393bfc/'],
        blockExplorerUrls: ['https://goerli.arbiscan.io/'],
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
        },
        chainId: '0x66EED',
        wethAddress: '0xefb283ef3167ca2ee9d93b201af15e2af3f6e8c7' as `0x${string}`,
        routerAddress: '0x059743b6d2937e583eddb7f9d99f5aaeefe6c30a' as `0x${string}`,
        rangeStakerAddress: '0xe5e2E95A986CE078606C403593593b18Ed98f4d6' as `0x${string}`,
        coverPoolFactory: '0x5c032AEC3a62AEC6a337D5f2aaA94905ecCBF06B' as `0x${string}`,
        coverSubgraphUrl: 'https://arbitrum-goerli.graph-eu.p2pify.com/e1fce33d6c91a225a19e134ec9eeff22/staging-cover-arbitrumGoerli',
        limitSubgraphUrl: 'https://arbitrum-goerli.graph-eu.p2pify.com/be2fe11b3c1319f93d21c5a3cbf4b2b6/limit-arbitrumGoerli-beta2'
    },
};