//eventually this functions should merge into one

import { fetchTokenPrice } from "./queries";
import { LimitSubgraph } from "./types";

export const logoMap = {
  USDC: "https://raw.githubusercontent.com/poolsharks-protocol/token-metadata/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  WETH: "https://raw.githubusercontent.com/poolsharks-protocol/token-metadata/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
  DAI: "https://raw.githubusercontent.com/poolsharks-protocol/token-metadata/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
};

export const defaultTokenLogo = "https://raw.githubusercontent.com/poolshark-protocol/token-metadata/master/blockchains/arbitrum-goerli/tokenZero.png"

export const fetchRangeTokenUSDPrice = (poolData, token, setTokenUSDPrice) => {
  try {
    setTokenUSDPrice(
      token.callId == 0 ? poolData.token0.usdPrice : poolData.token1.usdPrice
    );
  } catch (error) {
    console.log(error);
  }
};

export const fetchLimitTokenUSDPrice = (poolData, token, setTokenUSDPrice) => {
  try {
    setTokenUSDPrice(
      token.callId == 0 ? poolData.token0.usdPrice : poolData.token1.usdPrice
    );
  } catch (error) {
    console.log(error);
  }
};

export const fetchCoverTokenUSDPrice = (poolData, token, setTokenUSDPrice) => {
  try {
    setTokenUSDPrice(
      token.callId == 0 ? poolData.token0.usdPrice : poolData.token1.usdPrice
    );
  } catch (error) {
    console.log(error);
  }
};

export const getLimitTokenUsdPrice = async (
  tokenAddress: string,
  setTokenUSDPrice,
  client: LimitSubgraph,
) => {
  try {
    const tokenData = await fetchTokenPrice(client, tokenAddress);
    if (tokenData["data"]["tokens"] != undefined && tokenData["data"]["tokens"].length > 0) {
      const tokenUsdPrice = tokenData["data"]["tokens"]["0"]["usdPrice"];
      setTokenUSDPrice(tokenUsdPrice);
    } else {
      setTokenUSDPrice(0)
    }
  } catch (error) {
    console.log(error);
  }
};
