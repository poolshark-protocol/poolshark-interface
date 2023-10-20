import { BigNumber, ethers } from "ethers";
import { tokenSwap } from "../utils/types";
import { create } from "zustand";
import {
  getLimitPoolFromFactory,
} from "../utils/queries";

type ConfigState = {
  chainId: number
};

type ConfigAction = {
  //
  setChainId: (chainId: number) => void;
};

const initialConfigState: ConfigState = {
  //
  chainId: 0,
};

export const useConfigStore = create<ConfigState & ConfigAction>((set) => ({
  //trade pool
  chainId: initialConfigState.chainId,
  setChainId: (chainId: number) => {
    set(() => ({
      chainId: chainId,
    }));
  },
}));
