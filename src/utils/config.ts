import { chainProperties, supportedChainIds, supportedNetworkNames } from "./chains"
import { numStringFormat } from "./math/valueMath"

export const getRouterAddress = (networkName: string) => {
	if(chainProperties[networkName]) {
			if (chainProperties[networkName]["routerAddress"]) {
					return chainProperties[networkName]["routerAddress"]
			}
	}
	return chainProperties["arbitrum-one"]["routerAddress"]
}

export const getRangeStakerAddress = (networkName: string) => {
	if(chainProperties[networkName]) {
			if (chainProperties[networkName]["rangeStakerAddress"]) {
					return chainProperties[networkName]["rangeStakerAddress"]
			}
	}
	return chainProperties["arbitrum-one"]["rangeStakerAddress"]
}

export const getTokenBalance = (chainId: number, coin: any, tokenBalanceInfo: any) => {
	const networkName = supportedNetworkNames[supportedChainIds[chainId]]
	// if chain supports AlchemySDK use coin.balance
	if(chainProperties[networkName]) {
			if (chainProperties[networkName]?.sdkSupport?.alchemy) {
				return coin.balance ?? "0"
			}
	}
	// else use wagmi hook
	if (!isNaN(Number(tokenBalanceInfo?.formatted))) {
		return numStringFormat(tokenBalanceInfo?.formatted, 5)
	}
	return "0"
}

export const isAlchemySDKSupported = (chainId: number) => {
	// check chain id support
	const supportedChainId = supportedChainIds[chainId]
	if (supportedChainId) {
		// check network name support
		const supportedNetworkName = supportedNetworkNames[supportedChainId]
		if (supportedNetworkName) {
			// check chain config exists
			const chainConfig = chainProperties[supportedNetworkName]
			if (chainConfig) {
				// check alchemy sdk support
				if (chainConfig?.sdkSupport?.alchemy) {
					return true
				}
			}
		}
	}
	// default not supported
	return false
}
