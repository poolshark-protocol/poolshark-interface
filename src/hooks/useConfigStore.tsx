import { create } from "zustand";
import { CoverSubgraph, FinSubgraph, LimitSubgraph, oFin } from "../utils/types";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { logoMapKey } from "../utils/tokens";
import { chainProperties } from "../utils/chains";

type ConfigState = {
  chainId: number;
  networkName: string;
  finSubgraph: FinSubgraph;
  oFin: oFin;
  limitSubgraph: LimitSubgraph;
  coverSubgraph: CoverSubgraph;
  coverFactoryAddress: string;
  finToken: any;
  listedtokenList: any;
  searchtokenList: any;
  displayTokenList: any;
  logoMap: any;
};

type ConfigAction = {
  //
  setChainId: (chainId: number) => void;
  setNetworkName: (networkName: string) => void;
  setLimitSubgraph: (limitSubgraphUrl: string) => void;
  setCoverSubgraph: (coverSubgraphUrl: string) => void;
  setCoverFactoryAddress: (coverFactoryAddress: string) => void;
  setFinToken: (finToken: any) => void;
  setOFinStrikePrice: (strikePrice: string) => void;
  setListedTokenList: (listedtokenList: any) => void;
  setSearchTokenList: (searchtokenList: any) => void;
  setDisplayTokenList: (displayTokenList: any) => void;
};

const finDataNetworkName = chainProperties["fin-token"]["networkName"]
const finDataSubgraphUrl = chainProperties[finDataNetworkName]["limitSubgraphUrl"]

const initialConfigState: ConfigState = {
  //
  chainId: 0,
  networkName: "arbitrum",
  finSubgraph: new ApolloClient({
    cache: new InMemoryCache(),
    uri: finDataSubgraphUrl,
  }),
  oFin: {
    strikeDisplay: '1.5',
    strikePrice: 1.5,
    profitUsd: 0.5
  },
  limitSubgraph: undefined,
  coverSubgraph: undefined,
  coverFactoryAddress: undefined,
  finToken: {
    usdPrice: 0
  },
  listedtokenList: undefined,
  searchtokenList: undefined,
  displayTokenList: undefined,
  logoMap: {},
};

export const useConfigStore = create<ConfigState & ConfigAction>((set) => ({
  chainId: initialConfigState.chainId,
  networkName: initialConfigState.networkName,
  finSubgraph: initialConfigState.finSubgraph,
  limitSubgraph: initialConfigState.limitSubgraph,
  coverSubgraph: initialConfigState.coverSubgraph,
  coverFactoryAddress: initialConfigState.coverFactoryAddress,
  finToken: initialConfigState.finToken,
  oFin: initialConfigState.oFin,
  listedtokenList: initialConfigState.listedtokenList,
  searchtokenList: initialConfigState.searchtokenList,
  displayTokenList: initialConfigState.displayTokenList,
  logoMap: initialConfigState.logoMap,
  setChainId: (chainId: number) => {
    set(() => ({
      chainId: chainId,
    }));
  },
  setNetworkName: (networkName: string) => {
    set(() => ({
      networkName: networkName,
    }));
  },
  setLimitSubgraph: (limitSubgraphUrl: string) => {
    set(() => ({
      limitSubgraph: new ApolloClient({
        cache: new InMemoryCache(),
        uri: limitSubgraphUrl,
      }),
    }));
  },
  setCoverSubgraph: (coverSubgraphUrl: string) => {
    set(() => ({
      coverSubgraph: new ApolloClient({
        cache: new InMemoryCache(),
        uri: coverSubgraphUrl,
      }),
    }));
  },
  setCoverFactoryAddress(coverFactoryAddress: string) {
    set(() => ({
      coverFactoryAddress: coverFactoryAddress,
    }));
  },
  setFinToken: (finToken: any) => {
    set((state) => ({
      finToken: finToken,
      oFin: {
        ...state.oFin,
        profitUsd: finToken.usdPrice - state.oFin.strikePrice,
      }
    }));
  },
  setOFinStrikePrice: (strikePrice: string) => {
    const newStrikePrice = !isNaN(parseFloat(strikePrice)) ? parseFloat(strikePrice) : 1.5
    set((state) => ({
      oFin: {
        ...state.oFin,
        strikePrice: newStrikePrice,
        strikeDisplay: strikePrice,
        profitUsd: state.finToken.usdPrice - newStrikePrice
      }
    }));
  },
  setListedTokenList: (listedtokenList: any) => {
    const logoMap: any = {};
    set(() => ({
      listedtokenList: listedtokenList,
    }));
  },
  setSearchTokenList: (searchtokenList: any) => {
    const logoMap: any = {};
    searchtokenList.forEach((token: any) => {
      logoMap[logoMapKey(token)] = token.logoURI;
    });
    set(() => ({
      searchtokenList: searchtokenList,
      logoMap: logoMap,
    }));
  },
  setDisplayTokenList: (displaytokenList: any) => {
    set(() => ({
      displayTokenList: displaytokenList,
    }));
  },
}));
