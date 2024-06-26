import { Alchemy, Network } from "alchemy-sdk";
import { alchemyNetworks, chainIdsToNames } from "./chains";
import { BN_ZERO, ZERO_ADDRESS } from "./math/constants";
import { fetchTokenPrice } from "./queries";
import { LimitSubgraph, coinsList, token } from "./types";
import { BigNumber, ethers } from "ethers";
import axios from "axios";
import { numStringFormat, parseUnits } from "./math/valueMath";
import { formatUnits } from "ethers/lib/utils";

export const tokenListsBaseUrl =
  "https://poolshark-token-lists.s3.amazonaws.com/blockchains";

export const defaultTokenLogo =
  tokenListsBaseUrl + "/arbitrum-one/tokenZero.png";

export const fetchTokenUSDPrice = (poolData, token, setTokenUSDPrice) => {
  try {
    setTokenUSDPrice(
      token.callId == 0 ? poolData.token0.usdPrice : poolData.token1.usdPrice,
    );
  } catch (error) {
    console.log(error);
  }
};

export const getZeroForOne = (tokenA: any, tokenB: any) => {
  return tokenA.address.localeCompare(tokenB.address) < 0;
};

export const getLimitTokenUsdPrice = async (
  tokenAddress: string,
  setTokenUSDPrice,
  client: LimitSubgraph,
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

export const getLogo = (token: any, logoMap: any) => {
  // token.address = token.id ?? ZERO_ADDRESS
  return logoMap[logoMapKey(token)] ?? defaultTokenLogo;
};

export const logoMapKey = (token: any) => {
  return (
    (token?.address?.toLowerCase() ??
      token?.id?.toLowerCase() ??
      ZERO_ADDRESS) + nativeString(token)
  );
};

export const nativeString = (token: any) => {
  if (token?.native == undefined) {
    return "";
  } else if (token.native) {
    return "-native";
  }
  return "";
};

export const getUserBalance = (token: any, currentToken: any) => {
  if (token.address.toLowerCase() == currentToken.address.toLowerCase()) {
    return currentToken.userBalance ?? 0;
  }
  return 0;
};

export const getUserAllowance = (token: any, currentToken: any) => {
  if (token.address.toLowerCase() == currentToken.address.toLowerCase()) {
    return currentToken.userRouterAllowance ?? BN_ZERO;
  }
  return BN_ZERO;
};

export const hasAllowance = (token: token, amount: BigNumber): boolean => {
  if (token.native) {
    return true;
  } else if (!token.userRouterAllowance) {
    return false;
  }
  if (BigNumber.isBigNumber(token.userRouterAllowance)) {
    return token.userRouterAllowance?.gte(amount?.toString());
  } else if (typeof token.userRouterAllowance == "number") {
    return (
      token.userRouterAllowance >=
      parseFloat(formatUnits(amount, token.decimals))
    );
  }
  return false;
};

export const hasBalance = (token: token, amount: BigNumber): boolean => {
  if (!token.userBalance) {
    return false;
  }
  return parseUnits(token.userBalance?.toString(), token.decimals)?.gte(
    amount?.toString(),
  );
};

export const fetchListedTokenBalances = async (
  chainId: number,
  address: string,
  listed_tokens: any,
  search_tokens: any,
) => {
  // check if alchemy supported
  const config = {
    apiKey: "73s_R3kr7BizJjj4bYslsKBR9JH58cWI",
    network: alchemyNetworks[chainId] ?? Network.ARB_MAINNET,
  };
  const alchemy = new Alchemy(config);
  let ethBalance: BigNumber;
  try {
    // ethBalance = await alchemy.core.getBalance(address);
  } catch (e) {
    console.log("Alchemy SDK Error:", e);
    // early return - update balances on next fetch
    return;
  }
  const listedIndex = listed_tokens.findIndex((x) => x.native == true);
  const searchIndex = search_tokens.findIndex((x) => x.native == true);
  if (listedIndex != -1 && ethBalance) {
    listed_tokens[listedIndex].balance = numStringFormat(
      ethers.utils.formatUnits(ethBalance, listed_tokens[listedIndex].decimals),
      5,
    );
  }
  if (searchIndex != -1 && ethBalance) {
    search_tokens[searchIndex].balance = numStringFormat(
      ethers.utils.formatUnits(ethBalance, search_tokens[searchIndex].decimals),
      5,
    );
  }
  let tokenBalances;
  try {
    // tokenBalances = await alchemy.core.getTokenBalances(address);
  } catch (e) {
    console.log("Alchemy SDK Error:", e);
    // early return - update balances on next fetch
    return;
  }
  if (tokenBalances?.tokenBalances?.length != 0) {
    tokenBalances?.tokenBalances?.forEach((token) => {
      // @dev - the zero index will ALWAYS be the native token
      const listedIndex = listed_tokens.findIndex(
        (x) =>
          String(x.id).toLowerCase() ===
            String(token.contractAddress).toLowerCase() && x.native != true,
      );
      const searchIndex = search_tokens.findIndex(
        (x) =>
          String(x.id).toLowerCase() ===
            String(token.contractAddress).toLowerCase() && x.native != true,
      );
      if (listedIndex != -1) {
        listed_tokens[listedIndex].balance = numStringFormat(
          ethers.utils.formatUnits(
            token.tokenBalance,
            listed_tokens[listedIndex].decimals,
          ),
          5,
        );
      }
      if (searchIndex != -1) {
        search_tokens[searchIndex].balance = numStringFormat(
          ethers.utils.formatUnits(
            token.tokenBalance,
            search_tokens[searchIndex].decimals,
          ),
          5,
        );
      }
    });
  }
  setTimeout(() => {
    fetchListedTokenBalances(chainId, address, listed_tokens, search_tokens);
  }, 5000);
};

export const fetchTokenMetadata = async (
  chainId: number,
  setListedTokenList: any,
  setDisplayTokenList: any,
  setSearchTokenList: any,
  setIsLoading: any,
) => {
  const chainName = chainIdsToNames[chainId];
  axios
    .get(tokenListsBaseUrl + `/${chainName ?? "arbitrum-one"}/tokenlist.json`)
    .then(function (response) {
      const coins = {
        listed_tokens: response.data.listed_tokens,
        search_tokens: response.data.search_tokens,
      } as coinsList;
      for (let i = 0; i < coins.listed_tokens?.length; i++) {
        coins.listed_tokens[i].address = coins.listed_tokens[i].id;
      }
      if (coins.listed_tokens != undefined) {
        setListedTokenList(coins.listed_tokens);
        setDisplayTokenList(coins.listed_tokens);
      }
      //search tokens
      for (let i = 0; i < coins.search_tokens?.length; i++) {
        coins.search_tokens[i].address = coins.search_tokens[i].id;
      }
      if (coins.search_tokens != undefined) {
        setSearchTokenList(coins.search_tokens);
      }
      setIsLoading(false);
    })
    .catch(function (error) {
      console.log(error);
    });
};
