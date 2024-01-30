import axios from "axios";
import { chainProperties, supportedChainIds, supportedNetworkNames } from "./chains"
import { numStringFormat } from "./math/valueMath"
import { TradeSdkStatus, tokenSwap } from "./types";
import { ZERO_ADDRESS } from "./math/constants";
import { BigNumber } from "ethers";

export const addressMatches = (addressA: string, addressB: string): boolean => {
	return addressA.toLowerCase() == addressB.toLowerCase()
}

export const openoceanNativeAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as `0x${string}`;

export const getRouterAddress = (networkName: string, tradeSdkEnabled?: boolean, limitTabSelected?: boolean) => {
	if(chainProperties[networkName]) {
			if (tradeSdkEnabled && !limitTabSelected) {
				if (chainProperties[networkName]["openocean"] && 
						chainProperties[networkName]["openocean"]["routerAddress"]) {
					return chainProperties[networkName]["openocean"]["routerAddress"]
				}
			}
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

export const getTradeSdkEnabled = (networkName: string, tokenA: string, tokenB: string) => {
	// true if config set
	if (chainProperties[networkName]?.sdkSupport?.tradeSdk) {
		if (addressMatches(tokenA, chainProperties[networkName]["finAddress"])) {
			// false if tokenA is FIN
			return false
		} else if (addressMatches(tokenB, chainProperties[networkName]["finAddress"])) {
			// false if tokenB is FIN
			return false
		} else {
			// true otherwise
			return true
		}
	}
	// false otherwise
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

export const getOpenOceanQuote = async(
	tradeSdk: TradeSdkStatus,
	tokenIn: tokenSwap,
	tokenOut: tokenSwap,
	setTradeSdkQuotes: any,
	setTradeSdkEnabled: any
) => {
	const startSwap = new Date().getTime();
	console.log('token decimals', tokenIn.decimals, tokenOut.decimals)
	console.log('signer check2', tradeSdk.transfer.params.fromAddress, tradeSdk.transfer.params.chain)
	const response = await axios.get(
		`https://open-api.openocean.finance/v3/${tradeSdk.transfer.params.chain}/swap_quote`,
		{
			params: {
				inTokenAddress: tokenIn.native ? openoceanNativeAddress
											   : tokenIn.address,
				outTokenAddress: tokenOut.native ? openoceanNativeAddress
												 : tokenOut.address,
				amount: tradeSdk.transfer.params.amount,
				gasPrice: 100000000,
				slippage: tradeSdk.transfer.params.slippage,
				account: tradeSdk.transfer.params.fromAddress
			},
		}
	);
		// ?&outTokenAddress=0xaf88d065e77c8cC2239327C5EDb3A432268e5831&amount=0.001&gasPrice=100000000&slippage=1&account=0xBd5db4c7D55C086107f4e9D17c4c34395D1B1E1E");
	let elapsedSwap = new Date().getTime() - startSwap;
	console.log('swap quote check', elapsedSwap, response)
	if (response) {
		const quoteResponse = response.data.data;
		const swapCalldata = response.data.data.data;
		console.log('quote response:', quoteResponse, typeof(quoteResponse.inAmount))
		setTradeSdkQuotes(
			[
				{
					amountIn: BigNumber.from(quoteResponse.inAmount),
					amountOut: BigNumber.from(quoteResponse.outAmount)
				}
			],
			swapCalldata
		)
	}
}
