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
}

export type SwapParams = {
  to: string;
  priceLimit: BigNumber;
  amount: BigNumber;
  exactIn: boolean;
  zeroForOne: boolean;
  callbackData: string
}

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
};
