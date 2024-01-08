import { ZERO_ADDRESS } from "./math/constants";

export const defaultNetwork = "arbitrum"

export const chainIdsToNames = {
    1: 'ethereum',
    5: 'goerli',
    421613: 'arbitrum-goerli',
    42161: 'arbitrum-one',
};

export const decToHex = {
    1: '0x1',
    5: '0x5',
    421613: '0x66EED',
    42161: '0xA4B1',
};

export const supportedChainIds = {
    1: 'mainnet',
    5: 'goerli',
    421613: 'arbitrumGoerli',
    42161: 'arbitrum',
};

export const supportedNetworkNames = {
    'arbitrum-goerli': 'arbitrumGoerli',
    'arbitrum': 'arbitrum'
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
        explorerUrl: 'https://goerli.arbiscan.io/',
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
        },
        chainId: '0x66EED',
        wethAddress: '0xefb283ef3167ca2ee9d93b201af15e2af3f6e8c7' as `0x${string}`,
        daiAddress: '0x19beE8e887a5db5cf20A841eb4DAACBCacF14B1b' as `0x${string}`,
        finAddress: '0x742510a23bf83be959990a510ccae40b2d3d9b83',
        routerAddress: '0x24757e9D68bFCC99A9Dba0a62737703CB1A32e06' as `0x${string}`,
        rangeStakerAddress: '0xe5e2E95A986CE078606C403593593b18Ed98f4d6' as `0x${string}`,
        coverPoolFactory: '0x5c032AEC3a62AEC6a337D5f2aaA94905ecCBF06B' as `0x${string}`,
        coverSubgraphUrl: 'https://arbitrum-goerli.graph-eu.p2pify.com/e1fce33d6c91a225a19e134ec9eeff22/staging-cover-arbitrumGoerli',
        limitSubgraphUrl: 'https://arbitrum-goerli.graph-eu.p2pify.com/ff8e16f5454291a4fc3e361ff2c31a24/limit-arbitrumGoerli-test',
    },
    arbitrum: {
        chainName: 'Arbitrum One',
        logo:"https://raw.githubusercontent.com/poolshark-protocol/token-metadata/master/blockchains/arbitrum-one/logo.png",
        rpcUrls: ['https://patient-distinguished-pallet.arbitrum-mainnet.quiknode.pro/4cbe7cbdb55ec4b33fdc1a4239e1169b167ae351/'],
        explorerUrl: 'https://arbiscan.io/',
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
        },
        chainId: '0xA4B1',
        wethAddress: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1' as `0x${string}`,
        daiAddress: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1' as `0x${string}`,
        routerAddress: '0xdbee6a31d4437ee5534a011509a3fb11bb8e8bf7' as `0x${string}`,
        rangeStakerAddress: '0x0e2b069fa52064a7e0b5a044ba25142203210a13' as `0x${string}`,
        coverPoolFactory: ZERO_ADDRESS as `0x${string}`,
        coverSubgraphUrl: 'https://arbitrum-goerli.graph-eu.p2pify.com/e1fce33d6c91a225a19e134ec9eeff22/staging-cover-arbitrumGoerli',
        limitSubgraphUrl: 'https://arbitrum-mainnet.graph-eu.p2pify.com/27c3c2867e193dcf17ca262f64efe2a4/limit-arbitrum-redeploy',
        bondProtocol: {
            auctioneerAddress: "0xf7f9a96cdbfefd70bda14a8f30ec503b16bce9b1",
            tellerAddress: "0x007f7735baf391e207e3aa380bb53c4bd9a5fed6",
            vFinAddress: "0xFA3e62Aae5DE014c4CD20377Ec90Eb8e59d31169",
            wethAddress: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            bondTokenId: "50041069287616932026042816520963973508955622977186811114648766172172485699723",
            finAddress: "0x903ca00944d0b51e50d9f4fc96167c89f211542a", // FIN
            nullReferrer: "0x0000000000000000000000000000000000000000",
            marketSubgraphId: "42161_BondFixedTermFPA_120",
            marketId: 120,
            subgraphUrl: 'https://api.thegraph.com/subgraphs/name/bond-protocol/bond-protocol-arbitrum-mainnet',
        }
    },
};