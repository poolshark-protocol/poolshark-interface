import { create } from "zustand";

type ConfigState = {
  chainId: number
  networkName: string
};

type ConfigAction = {
  //
  setChainId: (chainId: number) => void;
  setNetworkName: (networkName: string) => void;
};

const initialConfigState: ConfigState = {
  //
  chainId: 0,
  networkName: ''
};

export const useConfigStore = create<ConfigState & ConfigAction>((set) => ({
  //trade pool
  chainId: initialConfigState.chainId,
  networkName: initialConfigState.networkName,
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
}));
