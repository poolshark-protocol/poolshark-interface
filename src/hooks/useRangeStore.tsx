import { BigNumber } from "ethers";
import { token } from "../utils/types";
import { BN_ZERO } from "../utils/math/constants";
import {
  tokenOneAddress,
  tokenZeroAddress,
} from "../constants/contractAddresses";
import { create } from "zustand";

type RangeState = {
  //poolAddress for current token pairs
  ////range
  rangePoolAddress: string;
  rangePoolData: any;
  rangeSlippage: string;
  //true if both tokens selected, false if only one token selected
  pairSelected: Boolean;
  //TokenIn defines the token on the left/up on a swap page
  tokenIn: token;
  tokenInRangeUSDPrice: number;
  tokenInRangeAllowance: string;
  tokenInBalance: string;
  //TokenOut defines the token on the left/up on a swap page
  tokenOut: token;
  tokenOutRangeUSDPrice: Number;
  tokenOutBalance: string;
  //Gas
  gasFee: BigNumber;
  gasLimit: BigNumber;
};

type RangeAction = {
  //pool
  /* setCoverPoolAddress: (address: String) => void;
  setCoverPoolData: (data: any) => void;
  setRangePoolAddress: (address: String) => void;
  setRangePoolData: (data: any) => void;
  setPairSelected: (pairSelected: Boolean) => void;
  //tokenIn
  setTokenIn: (tokenOut: token, newToken: token) => void;
  setTokenInRangeUSDPrice: (price: number) => void;
  setTokenInCoverUSDPrice: (price: number) => void;
  setTokenInRangeAllowance: (allowance: string) => void;
  setTokenInCoverAllowance: (allowance: string) => void;
  setTokenInBalance: (balance: string) => void;
  //tokenOut
  setTokenOut: (tokenOut: token, newToken: token) => void;
  setTokenOutRangeUSDPrice: (price: number) => void;
  setTokenOutCoverUSDPrice: (price: number) => void;
  setTokenOutBalance: (balance: string) => void;
  //gas
  setGasFee: (fee: BigNumber) => void;
  setGasLimit: (limit: BigNumber) => void; */
  //reset
  setRangePoolAddress: (address: String) => void;
  setRangePoolData: (data: any) => void;
  setTokenIn: (tokenOut: any, newToken: any) => void;
  setTokenOut: (tokenOut: any, newToken: any) => void;
  resetSwapParams: () => void;
};

const initialSwapState: RangeState = {
  //pools
  rangePoolAddress: "",
  rangePoolData: {},
  rangeSlippage: "0.5",
  //
  //this should be false in production, initial value is true because tokenAddresses are hardcoded for testing
  pairSelected: true,
  //
  tokenIn: {
    callId: 0,
    name: "Wrapped Ether",
    symbol: "WETH",
    logoURI: "/static/images/eth_icon.png",
    address: tokenOneAddress,
  } as token,
  tokenInRangeUSDPrice: 0,
  tokenInRangeAllowance: "0.00",
  tokenInBalance: "0.00",
  //
  tokenOut: {
    callId: 1,
    name: "Select Token",
    symbol: "Select Token",
    logoURI: "",
    address: tokenZeroAddress,
  } as token,
  tokenOutRangeUSDPrice: 0,
  tokenOutBalance: "0.00",
  //
  gasFee: BN_ZERO,
  gasLimit: BN_ZERO,
};

export const useRangeStore = create<RangeState & RangeAction>((set) => ({
  //pool
  rangePoolAddress: initialSwapState.rangePoolAddress,
  rangePoolData: initialSwapState.rangePoolData,
  rangeSlippage: initialSwapState.rangeSlippage,
  pairSelected: initialSwapState.pairSelected,
  //tokenIn
  tokenIn: initialSwapState.tokenIn,
  tokenInRangeUSDPrice: initialSwapState.tokenInRangeUSDPrice,
  tokenInRangeAllowance: initialSwapState.tokenInRangeAllowance,
  tokenInBalance: initialSwapState.tokenInBalance,
  //tokenOut
  tokenOut: initialSwapState.tokenOut,
  tokenOutRangeUSDPrice: initialSwapState.tokenOutRangeUSDPrice,
  tokenOutBalance: initialSwapState.tokenOutBalance,
  //gas
  gasFee: initialSwapState.gasFee,
  gasLimit: initialSwapState.gasLimit,
  setTokenIn: (tokenOut, newToken: token) => {
    //if tokenOut is selected
    if (
      tokenOut.address != initialSwapState.tokenOut.address ||
      tokenOut.symbol != "Select Token"
    ) {
      //if the new tokenIn is the same as the selected TokenOut, get TokenOut back to  initialState
      if (newToken.address == tokenOut.address) {
        set(() => ({
          tokenIn: {
            callId: 0,
            ...newToken,
          },
          tokenOut: initialSwapState.tokenOut,
          pairSelected: false,
        }));
      } else {
        //if tokens are different
        set(() => ({
          tokenIn: {
            callId: newToken.address < tokenOut.address ? 0 : 1,
            ...newToken,
          },
          pairSelected: true,
        }));
      }
    } else {
      //if tokenOut its not selected
      set(() => ({
        tokenIn: {
          callId: 0,
          ...newToken,
        },
        pairSelected: false,
      }));
    }
  },
  setTokenInRangeUSDPrice: (newPrice: number) => {
    set(() => ({
      tokenInRangeUSDPrice: newPrice,
    }));
  },

  setTokenInRangeAllowance: (newAllowance: string) => {
    set(() => ({
      tokenInRangeAllowance: newAllowance,
    }));
  },

  setTokenInBalance: (newBalance: string) => {
    set(() => ({
      tokenInBalance: newBalance,
    }));
  },
  setTokenOutRangeUSDPrice: (newPrice: number) => {
    set(() => ({
      tokenOutRangeUSDPrice: newPrice,
    }));
  },

  setTokenOut: (tokenIn, newToken: token) => {
    //if tokenIn exists
    if (
      tokenIn.address != initialSwapState.tokenOut.address ||
      tokenIn.symbol != "Select Token"
    ) {
      //if the new selected TokenOut is the same as the current tokenIn, erase the values on TokenIn
      if (newToken.address == tokenIn.address) {
        set(() => ({
          tokenOut: { callId: 0, ...newToken },
          tokenIn: initialSwapState.tokenOut,
          pairSelected: false,
        }));
      } else {
        //if tokens are different
        set(() => ({
          tokenOut: {
            callId: newToken.address < tokenIn.address ? 0 : 1,
            ...newToken,
          },
          pairSelected: true,
        }));
      }
    } else {
      //if tokenIn its not selected
      set(() => ({
        tokenOut: { callId: 0, ...newToken },
        pairSelected: false,
      }));
    }
  },
  setTokenOutBalance: (newBalance: string) => {
    set(() => ({
      tokenOutBalance: newBalance,
    }));
  },
  setRangePoolAddress: (rangePoolAddress: string) => {
    set(() => ({
      rangePoolAddress: rangePoolAddress,
    }));
  },
  setRangePoolData: (rangePoolData: any) => {
    set(() => ({
      rangePoolData: rangePoolData,
    }));
  },
  setRangeSlippage: (rangeSlippage: string) => {
    set(() => ({
      rangeSlippage: rangeSlippage,
    }));
  },

  switchDirection: () => {
    set((state) => ({
      tokenIn: state.tokenOut,
      tokenOut: state.tokenIn,
    }));
  },
  resetSwapParams: () => {
    set({
      rangePoolAddress: initialSwapState.rangePoolAddress,
      rangePoolData: initialSwapState.rangePoolData,
      pairSelected: initialSwapState.pairSelected,
      //tokenIn
      tokenIn: initialSwapState.tokenIn,
      tokenInRangeUSDPrice: initialSwapState.tokenInRangeUSDPrice,
      tokenInRangeAllowance: initialSwapState.tokenInRangeAllowance,
      tokenInBalance: initialSwapState.tokenInBalance,
      //tokenOut
      tokenOut: initialSwapState.tokenOut,
      tokenOutRangeUSDPrice: initialSwapState.tokenOutRangeUSDPrice,
      tokenOutBalance: initialSwapState.tokenOutBalance,
      //gas
      gasFee: initialSwapState.gasFee,
      gasLimit: initialSwapState.gasLimit,
    });
  },
}));
