//eventually this functions should merge into one

import { fetchTokenPrice } from "./queries";
import { LimitSubgraph } from "./types";

export const defaultTokenLogo =
  "https://raw.githubusercontent.com/poolshark-protocol/token-metadata/master/blockchains/arbitrum-goerli/tokenZero.png";

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
  client: LimitSubgraph
) => {
  try {
    const tokenData = await fetchTokenPrice(client, tokenAddress);
    if (
      tokenData["data"]["tokens"] != undefined &&
      tokenData["data"]["tokens"].length > 0
    ) {
      console.log('token found')
      const tokenUsdPrice = tokenData["data"]["tokens"]["0"]["usdPrice"];
      setTokenUSDPrice(tokenUsdPrice);
    } else {
      setTokenUSDPrice(0);
    }
  } catch (error) {
    console.log(error);
  }
};
