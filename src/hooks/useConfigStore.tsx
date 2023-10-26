import { create } from "zustand";
import { CoverSubgraph, LimitSubgraph } from "../utils/types";
import { ApolloClient, InMemoryCache } from "@apollo/client";

type ConfigState = {
  chainId: number
  networkName: string
  limitSubgraph: LimitSubgraph
  coverSubgraph: CoverSubgraph
};

type ConfigAction = {
  //
  setChainId: (chainId: number) => void;
  setNetworkName: (networkName: string) => void;
  setLimitSubgraph: (limitSubgraphUrl: string) => void;
  setCoverSubgraph: (coverSubgraphUrl: string) => void;
};

const initialConfigState: ConfigState = {
  //
  chainId: 0,
  networkName: '',
  limitSubgraph: undefined,
  coverSubgraph: undefined,
};

export const useConfigStore = create<ConfigState & ConfigAction>((set) => ({
  //trade pool
  chainId: initialConfigState.chainId,
  networkName: initialConfigState.networkName,
  limitSubgraph: initialConfigState.limitSubgraph,
  coverSubgraph: initialConfigState.coverSubgraph,
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
}));
