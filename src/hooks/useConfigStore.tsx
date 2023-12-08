import { create } from "zustand";
import { CoverSubgraph, LimitSubgraph } from "../utils/types";
import { ApolloClient, InMemoryCache } from "@apollo/client";

type ConfigState = {
  chainId: number;
  networkName: string;
  limitSubgraph: LimitSubgraph;
  coverSubgraph: CoverSubgraph;
  coverFactoryAddress: string;
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
  setListedTokenList: (listedtokenList: any) => void;
  setSearchTokenList: (searchtokenList: any) => void;
  setDisplayTokenList: (displayTokenList: any) => void;
};

const initialConfigState: ConfigState = {
  //
  chainId: 0,
  networkName: "arbitrum",
  limitSubgraph: undefined,
  coverSubgraph: undefined,
  coverFactoryAddress: undefined,
  listedtokenList: undefined,
  searchtokenList: undefined,
  displayTokenList: undefined,
  logoMap: {},
};

export const useConfigStore = create<ConfigState & ConfigAction>((set) => ({
  //trade pool
  chainId: initialConfigState.chainId,
  networkName: initialConfigState.networkName,
  limitSubgraph: initialConfigState.limitSubgraph,
  coverSubgraph: initialConfigState.coverSubgraph,
  coverFactoryAddress: initialConfigState.coverFactoryAddress,
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
  setListedTokenList: (listedtokenList: any) => {
    const logoMap: any = {};
    listedtokenList.forEach((token: any) => {
      console.log('native check:', token.id.toLowerCase(), token.native ?? false, token.id.toLowerCase() + String(token.native ?? false))
      logoMap[token.id.toLowerCase() + String(token.native ?? false)] = token.logoURI;
    });
    set(() => ({
      listedtokenList: listedtokenList,
      logoMap: logoMap,
    }));
  },
  setSearchTokenList: (searchtokenList: any) => {
    set(() => ({
      searchtokenList: searchtokenList,
    }));
  },
  setDisplayTokenList: (displaytokenList: any) => {
    set(() => ({
      displayTokenList: displaytokenList,
    }));
  },
}));
