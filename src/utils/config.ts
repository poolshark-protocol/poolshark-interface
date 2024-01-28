import { chainProperties, supportedChainIds, supportedNetworkNames } from "./chains"
import { numStringFormat } from "./math/valueMath"

export const addressMatches = (addressA: string, addressB: string): boolean => {
	return addressA.toLowerCase() == addressB.toLowerCase()
}

export const openoceanNativeAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as `0x${string}`;

export const getRouterAddress = (networkName: string, tradeSdkEnabled?: boolean) => {
	if(chainProperties[networkName]) {
			// if (tradeSdkEnabled) {
			// 	if (chainProperties[networkName]["openocean"] && 
			// 			chainProperties[networkName]["openocean"]["routerAddress"]) {
			// 		return chainProperties[networkName]["openocean"]["routerAddress"]
			// 	}
			// }
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

export const getTradeSDKEnabled = (networkName: string, tokenA: string, tokenB: string) => {
	// arbitrum
	console.log('tradeSdk check', networkName, tokenB, chainProperties[networkName]["finAddress"], tokenA == chainProperties[networkName]["finAddress"], tokenB == chainProperties[networkName]["finAddress"])
	if (networkName == "arbitrum-one") {
		if(chainProperties[networkName]) {
			if (addressMatches(tokenA, chainProperties[networkName]["finAddress"])) {
				// false if tokenA is FIN
				return false
			} else if (addressMatches(tokenB, chainProperties[networkName]["finAddress"])) {
				// false if tokenB is FIN
				return false
			} else {
				// true otherwise
				console.log('tradeSdk sdk enabled')
				return true
			}
		}
		// true by default
		return true
	}
	// false for other networks
	return false
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
