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

export const chainProperties = {
    mainnet: {
        chainName: 'Ethereum Mainnet',
        logo:"https://raw.githubusercontent.com/poolsharks-protocol/token-metadata/master/blockchains/ethereum/logo.png",
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
        rpcUrls: ['https://red-dawn-sailboat.arbitrum-goerli.quiknode.pro/560eae745e6413070c559ecee53af45f5255414b/'],
        blockExplorerUrls: ['https://goerli.arbiscan.io/'],
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
        },
        chainId: '0x66EED',
        routerAddress: '0x978601712b7c107f5cf99c76d5b5dfa8db03d3b6' as `0x${string}`,
        coverPoolFactory: '0x479C2Df7eD63ea26146Ac2092C55047C3928A5A6',
        limitPoolFactory: '0xbd6d010bcecc7440a72889546411e0edbb333ea2',

    },
};