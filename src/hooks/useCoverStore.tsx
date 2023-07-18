import { BigNumber } from "ethers";
import { token } from "../utils/types";
import { BN_ZERO } from "../utils/math/constants";
import {
  tokenOneAddress,
  tokenZeroAddress,
} from "../constants/contractAddresses";
import { create } from "zustand";

type CoverState = {
  //poolAddress for current token pairs
  coverPoolAddress: `0x${string}`;
  coverPoolData: any;
  coverPositionData: any;
  coverSlippage: string;
  //true if both tokens selected, false if only one token selected
  pairSelected: Boolean;
  //TokenIn defines the token on the left/up on a swap page
  tokenIn: token;
  tokenInAmount: string;
  tokenInCoverUSDPrice: number;
  tokenInCoverAllowance: string;
  tokenInBalance: string;
  //TokenOut defines the token on the left/up on a swap page
  tokenOut: token;
  tokenOutCoverUSDPrice: Number;
  tokenOutBalance: string;
  //Gas
  gasFee: BigNumber;
  gasLimit: BigNumber;
};

type CoverAction = {
  //pool
  setCoverPoolAddress: (address: String) => void;
  setCoverPoolData: (data: any) => void;
  //setPairSelected: (pairSelected: Boolean) => void;
  //tokenIn
  setTokenIn: (tokenOut: token, newToken: token) => void;
  setTokenInAmount: (amount: string) => void;
  setTokenInCoverUSDPrice: (price: number) => void;
  setTokenInCoverAllowance: (allowance: string) => void;
  setTokenInBalance: (balance: string) => void;
  //tokenOut
  setTokenOut: (tokenOut: token, newToken: token) => void;
  setTokenOutCoverUSDPrice: (price: number) => void;
  setTokenOutBalance: (balance: string) => void;
  //gas
  setGasFee: (fee: BigNumber) => void;
  setGasLimit: (limit: BigNumber) => void;
  //reset
  resetSwapParams: () => void;
};

const initialCoverState: CoverState = {
  //pools
  coverPoolAddress: "0x00",
  coverPoolData: {},
  coverPositionData: {},
  coverSlippage: "0.5",
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
  tokenInAmount: "0.00",
  tokenInCoverUSDPrice: 0,
  tokenInCoverAllowance: "0.00",
  tokenInBalance: "0.00",
  //
  tokenOut: {
    callId: 1,
    name: "Select Token",
    symbol: "Select Token",
    logoURI: "",
    address: tokenZeroAddress,
  } as token,
  tokenOutCoverUSDPrice: 0,
  tokenOutBalance: "0.00",
  //
  gasFee: BN_ZERO,
  gasLimit: BN_ZERO,
};

export const useCoverStore = create<CoverState & CoverAction>((set) => ({
  //pool
  coverPoolAddress: initialCoverState.coverPoolAddress,
  coverPoolData: initialCoverState.coverPoolData,
  coverPositionData: initialCoverState.coverPositionData,
  coverSlippage: initialCoverState.coverSlippage,
  pairSelected: initialCoverState.pairSelected,
  //tokenIn
  tokenIn: initialCoverState.tokenIn,
  tokenInAmount: initialCoverState.tokenInAmount,
  tokenInCoverUSDPrice: initialCoverState.tokenInCoverUSDPrice,
  tokenInCoverAllowance: initialCoverState.tokenInCoverAllowance,
  tokenInBalance: initialCoverState.tokenInBalance,
  //tokenOut
  tokenOut: initialCoverState.tokenOut,
  tokenOutCoverUSDPrice: initialCoverState.tokenOutCoverUSDPrice,
  tokenOutBalance: initialCoverState.tokenOutBalance,
  //gas
  gasFee: initialCoverState.gasFee,
  gasLimit: initialCoverState.gasLimit,
  setTokenIn: (tokenOut, newToken: token) => {
    //if tokenOut is selected
    if (
      tokenOut.address != initialCoverState.tokenOut.address ||
      tokenOut.symbol != "Select Token"
    ) {
      //if the new tokenIn is the same as the selected TokenOut, get TokenOut back to  initialState
      if (newToken.address == tokenOut.address) {
        set(() => ({
          tokenIn: {
            callId: 0,
            ...newToken,
          },
          tokenOut: initialCoverState.tokenOut,
          pairSelected: false,
        }));
      } else {
        //if tokens are different
        set(() => ({
          tokenIn: {
            callId:
              newToken.address.localeCompare(tokenOut.address) < 0 ? 0 : 1,
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
  setTokenInAmount: (newAmount: string) => {
    set(() => ({
      tokenInAmount: newAmount,
    }));
  },

  setTokenInCoverUSDPrice: (newPrice: number) => {
    set(() => ({
      tokenInCoverUSDPrice: newPrice,
    }));
  },

  setTokenInCoverAllowance: (newAllowance: string) => {
    set(() => ({
      tokenInCoverAllowance: newAllowance,
    }));
  },
  setTokenInBalance: (newBalance: string) => {
    set(() => ({
      tokenInBalance: newBalance,
    }));
  },

  setTokenOutCoverUSDPrice: (newPrice: number) => {
    set(() => ({
      tokenOutCoverUSDPrice: newPrice,
    }));
  },
  setTokenOut: (tokenIn, newToken: token) => {
    //if tokenIn exists
    if (
      tokenIn.address != initialCoverState.tokenOut.address ||
      tokenIn.symbol != "Select Token"
    ) {
      //if the new selected TokenOut is the same as the current tokenIn, erase the values on TokenIn
      if (newToken.address == tokenIn.address) {
        set(() => ({
          tokenOut: { callId: 0, ...newToken },
          tokenIn: initialCoverState.tokenOut,
          pairSelected: false,
        }));
      } else {
        //if tokens are different
        set(() => ({
          tokenOut: {
            callId: newToken.address.localeCompare(tokenIn.address) < 0 ? 0 : 1,
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

  setCoverPoolAddress: (coverPoolAddress: `0x${string}`) => {
    set(() => ({
      coverPoolAddress: coverPoolAddress,
    }));
  },
  setCoverPoolData: (coverPoolData: any) => {
    set(() => ({
      coverPoolData: coverPoolData,
    }));
  },
  setCoverSlippage: (coverSlippage: string) => {
    set(() => ({
      coverSlippage: coverSlippage,
    }));
  },
  setGasFee: (gasFee: BigNumber) => {
    set(() => ({
      gasFee: gasFee,
    }));
  },
  setGasLimit: (gasLimit: BigNumber) => {
    set(() => ({
      gasLimit: gasLimit,
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
      coverPoolAddress: initialCoverState.coverPoolAddress,
      coverPoolData: initialCoverState.coverPoolData,

      pairSelected: initialCoverState.pairSelected,
      //tokenIn
      tokenIn: initialCoverState.tokenIn,
      tokenInCoverUSDPrice: initialCoverState.tokenInCoverUSDPrice,
      tokenInCoverAllowance: initialCoverState.tokenInCoverAllowance,
      tokenInBalance: initialCoverState.tokenInBalance,
      //tokenOut
      tokenOut: initialCoverState.tokenOut,
      tokenOutCoverUSDPrice: initialCoverState.tokenOutCoverUSDPrice,
      tokenOutBalance: initialCoverState.tokenOutBalance,
      //gas
      gasFee: initialCoverState.gasFee,
      gasLimit: initialCoverState.gasLimit,
    });
  },
}));
