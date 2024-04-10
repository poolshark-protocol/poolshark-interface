import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { BigNumber } from "ethers";

export type coinsList = {
  [x: string]: any;
  listed_tokens: coinRaw[];
};

export type coinRaw = {
  id: `0x${string}`;
  address: `0x${string}`;
  name: string;
  symbol: string;
  logoURI: string;
  decimals: number;
  balance: number;
};

export type QuoteParams = {
  priceLimit: BigNumber;
  amount: BigNumber;
  exactIn: boolean;
  zeroForOne: boolean;
};

export type QuoteResults = {
  amountIn: BigNumber;
  amountOut: BigNumber;
  pool: string;
  priceAfter: BigNumber;
};

export type SwapParams = {
  to: string;
  priceLimit: BigNumber;
  amount: BigNumber;
  exactIn: boolean;
  zeroForOne: boolean;
  callbackData: string;
};

export type tokenSwap = {
  callId: number;
  name: string;
  symbol: string;
  logoURI: string;
  address: `0x${string}`;
  decimals: number;
  userBalance: number;
  userRouterAllowance: BigNumber;
  USDPrice: number;
  native: boolean;
};

export type tokenRangeLimit = {
  callId: number;
  name: string;
  symbol: string;
  logoURI: string;
  address: `0x${string}`;
  decimals: number;
  userBalance: number;
  userRouterAllowance: BigNumber;
  USDPrice: number;
  native: boolean;
};

export type tokenCover = {
  callId: number;
  name: string;
  symbol: string;
  logoURI: string;
  address: `0x${string}`;
  decimals: number;
  userBalance: number;
  userRouterAllowance: number;
  coverUSDPrice: number;
  native: boolean;
};

export type oFin = {
  strikeDisplay: string;
  strikePrice: number;
  profitUsd: number;
};

export type RangePool24HData = {
  volumeUsd: number;
  feesUsd: number;
};

export type baseToken = {
  address: `0x${string}`;
  decimals: number;
};

export type SwapNativeButtonsProps = {
  disabled: boolean;
  routerAddress: any;
  wethAddress: any;
  tokenInSymbol: string;
  amountIn: BigNumber;
  gasLimit: BigNumber;
  resetAfterSwap: () => void;
};

export type token = tokenCover | tokenRangeLimit | tokenSwap;

export type LimitSubgraph = ApolloClient<NormalizedCacheObject>;

export type CoverSubgraph = ApolloClient<NormalizedCacheObject>;

export type FinSubgraph = ApolloClient<NormalizedCacheObject>;
