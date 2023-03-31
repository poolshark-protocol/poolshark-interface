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
    },
    arbitrumGoerli: {
        chainName: 'Arbitrum Goerli Test Network',
        logo:"https://assets.trustwalletapp.com/blockchains/polygon/assets/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/logo.png",
        rpcUrls: ['https://arb-goerli.g.alchemy.com/v2/M8Dr_KQx46ghJ93XDQe7j778Qa92HRn2/'],
        blockExplorerUrls: ['https://goerli.arbiscan.io/'],
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
        },
        chainId: '0x66EED',
    },

};