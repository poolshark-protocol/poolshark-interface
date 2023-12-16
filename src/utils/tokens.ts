//eventually this functions should merge into one

import { ZERO_ADDRESS } from "./math/constants";
import { fetchTokenPrice } from "./queries";
import { LimitSubgraph } from "./types";

export const defaultTokenLogo =
//TODO: arbitrumOne values
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
      tokenData["data"] &&
      tokenData["data"]["tokens"] != undefined &&
      tokenData["data"]["tokens"].length > 0
    ) {
      const tokenUsdPrice = tokenData["data"]["tokens"]["0"]["usdPrice"];
      setTokenUSDPrice(tokenUsdPrice);
    } else {
      setTokenUSDPrice(0);
    }
  } catch (error) {
    console.log(error);
  }
};

export const getLogoURI = (logoMap: any, token: any) => {
  return logoMap[(token?.address?.toLowerCase() ?? ZERO_ADDRESS) + nativeString(token)] ?? defaultTokenLogo
}

export const nativeString = (token: any) => {
  if (token?.native == undefined) {
    return ''
  } else if (token.native) {
    return '-native'
  }
  return ''
}
