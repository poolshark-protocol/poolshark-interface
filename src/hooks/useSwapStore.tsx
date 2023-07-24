import { BigNumber } from "ethers";
import { token } from "../utils/types";
import { BN_ZERO } from "../utils/math/constants";
import {
  tokenOneAddress,
  tokenZeroAddress,
} from "../constants/contractAddresses";
import { create } from "zustand";

type SwapState = {
  //poolAddress for current token pairs
  ////cover
  coverPoolAddress: String;
  coverPoolData: any;
  coverSlippage: string;
  ////range
  rangePoolAddress: String;
  rangePoolData: any;
  rangeSlippage: string;
  //true if both tokens selected, false if only one token selected
  pairSelected: Boolean;
  //TokenIn defines the token on the left/up on a swap page
  tokenIn: token;
  tokenInRangeUSDPrice: number;
  tokenInCoverUSDPrice: number;
  tokenInRangeAllowance: string;
  tokenInCoverAllowance: string;
  tokenInBalance: string;
  //TokenOut defines the token on the left/up on a swap page
  tokenOut: token;
  tokenOutRangeUSDPrice: Number;
  tokenOutCoverUSDPrice: Number;
  tokenOutBalance: string;
  //Gas
  gasFee: string;
  gasLimit: BigNumber;
  mintGasFee: string;
  mintGasLimit: BigNumber;
};

type SwapAction = {
  //pool
  setCoverPoolAddress: (address: String) => void;
  setCoverPoolData: (data: any) => void;
  setRangePoolAddress: (address: String) => void;
  setRangePoolData: (data: any) => void;
  setPairSelected: (pairSelected: Boolean) => void;
  //tokenIn
  setTokenIn: (tokenOut: token, newToken: token) => void;
  //setTokenInRangeUSDPrice: (price: number) => void;
  //setTokenInCoverUSDPrice: (price: number) => void;
  setTokenInRangeAllowance: (allowance: string) => void;
  setTokenInCoverAllowance: (allowance: string) => void;
  setTokenInBalance: (balance: string) => void;
  //tokenOut
  setTokenOut: (tokenOut: token, newToken: token) => void;
  //setTokenOutRangeUSDPrice: (price: number) => void;
  //setTokenOutCoverUSDPrice: (price: number) => void;
  setTokenOutBalance: (balance: string) => void;
  //gas
  setGasFee: (fee: string) => void;
  setGasLimit: (limit: BigNumber) => void;
  setMintGasFee: (fee: string) => void;
  setMintGasLimit: (limit: BigNumber) => void;
  //reset
  resetSwapParams: () => void;
};

const initialSwapState: SwapState = {
  //pools
  coverPoolAddress: "",
  coverPoolData: {},
  coverSlippage: "0.5",
  rangePoolAddress: "",
  rangePoolData: {},
  rangeSlippage: "0.5",
  //
  pairSelected: false,
  //
  tokenIn: {
    callId: 0,
    name: "Wrapped Ether",
    symbol: "WETH",
    logoURI: "/static/images/eth_icon.png",
    address: tokenOneAddress,
  } as token,
  tokenInRangeUSDPrice: 0,
  tokenInCoverUSDPrice: 0,
  tokenInRangeAllowance: "0.00",
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
  tokenOutRangeUSDPrice: 0,
  tokenOutCoverUSDPrice: 0,
  tokenOutBalance: "0.00",
  //
  gasFee: "$0.00",
  gasLimit: BN_ZERO,
  mintGasFee: "$0.00",
  mintGasLimit: BN_ZERO,
};

export const useSwapStore = create<SwapState & SwapAction>((set) => ({
  //pool
  coverPoolAddress: initialSwapState.coverPoolAddress,
  coverPoolData: initialSwapState.coverPoolData,
  coverSlippage: initialSwapState.coverSlippage,
  rangePoolAddress: initialSwapState.rangePoolAddress,
  rangePoolData: initialSwapState.rangePoolData,
  rangeSlippage: initialSwapState.rangeSlippage,
  pairSelected: initialSwapState.pairSelected,
  //tokenIn
  tokenIn: initialSwapState.tokenIn,
  tokenInRangeUSDPrice: initialSwapState.tokenInRangeUSDPrice,
  tokenInCoverUSDPrice: initialSwapState.tokenInCoverUSDPrice,
  tokenInRangeAllowance: initialSwapState.tokenInRangeAllowance,
  tokenInCoverAllowance: initialSwapState.tokenInCoverAllowance,
  tokenInBalance: initialSwapState.tokenInBalance,
  //tokenOut
  tokenOut: initialSwapState.tokenOut,
  tokenOutRangeUSDPrice: initialSwapState.tokenOutRangeUSDPrice,
  tokenOutCoverUSDPrice: initialSwapState.tokenOutCoverUSDPrice,
  tokenOutBalance: initialSwapState.tokenOutBalance,
  //gas
  gasFee: initialSwapState.gasFee,
  gasLimit: initialSwapState.gasLimit,
  mintGasFee: initialSwapState.mintGasFee,
  mintGasLimit: initialSwapState.mintGasLimit,
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
            callId: newToken.address.localeCompare(tokenOut.address) < 0 ? 0 : 1,
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
  setTokenInCoverUSDPrice: (newPrice: number) => {
    set(() => ({
      tokenInCoverUSDPrice: newPrice,
    }));
  },
  setTokenInRangeAllowance: (newAllowance: string) => {
    set(() => ({
      tokenInRangeAllowance: newAllowance,
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
  setTokenOutRangeUSDPrice: (newPrice: number) => {
    set(() => ({
      tokenOutRangeUSDPrice: newPrice,
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
  setPairSelected: (pairSelected: boolean) => {
    set(() => ({
      pairSelected: pairSelected,
    }));
  },
  setCoverPoolAddress: (coverPoolAddress: string) => {
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
  setGasFee: (gasFee: string) => {
    set(() => ({
      gasFee: gasFee,
    }));
  },
  setGasLimit: (gasLimit: BigNumber) => {
    set(() => ({
      gasLimit: gasLimit,
    }));
  },
  setMintGasFee: (mintGasFee: string) => {
    set(() => ({
      mintGasFee: mintGasFee,
    }));
  },
  setMintGasLimit: (mintGasLimit: BigNumber) => {
    set(() => ({
      mintGasLimit: mintGasLimit,
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
      coverPoolAddress: initialSwapState.coverPoolAddress,
      coverPoolData: initialSwapState.coverPoolData,
      rangePoolAddress: initialSwapState.rangePoolAddress,
      rangePoolData: initialSwapState.rangePoolData,
      pairSelected: initialSwapState.pairSelected,
      //tokenIn
      tokenIn: initialSwapState.tokenIn,
      tokenInRangeUSDPrice: initialSwapState.tokenInRangeUSDPrice,
      tokenInCoverUSDPrice: initialSwapState.tokenInCoverUSDPrice,
      tokenInRangeAllowance: initialSwapState.tokenInRangeAllowance,
      tokenInCoverAllowance: initialSwapState.tokenInCoverAllowance,
      tokenInBalance: initialSwapState.tokenInBalance,
      //tokenOut
      tokenOut: initialSwapState.tokenOut,
      tokenOutRangeUSDPrice: initialSwapState.tokenOutRangeUSDPrice,
      tokenOutCoverUSDPrice: initialSwapState.tokenOutCoverUSDPrice,
      tokenOutBalance: initialSwapState.tokenOutBalance,
      //gas
      gasFee: initialSwapState.gasFee,
      gasLimit: initialSwapState.gasLimit,
      mintGasFee: initialSwapState.mintGasFee,
      mintGasLimit: initialSwapState.mintGasLimit,
    });
  },
}));
