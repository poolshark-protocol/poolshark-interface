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

export type tokenSwap = {
  callId: number;
  name: string;
  symbol: string;
  logoURI: string;
  address: `0x${string}`;
  decimals: number;
  userBalance: number;
  userPoolAllowance: number;
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
  userPoolAllowance: BigNumber;
  rangeUSDPrice: number;
};

export type tokenCover = {
  callId: number;
  name: string;
  symbol: string;
  logoURI: string;
  address: `0x${string}`;
  decimals: number;
  userBalance: number;
  userPoolAllowance: number;
  coverUSDPrice: number;
};
