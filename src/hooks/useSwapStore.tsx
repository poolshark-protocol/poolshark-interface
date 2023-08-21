import { BigNumber } from "ethers";
import { tokenSwap } from "../utils/types";
import { BN_ZERO } from "../utils/math/constants";
import {
  tokenOneAddress,
  tokenZeroAddress,
} from "../constants/contractAddresses";
import { create } from "zustand";

type SwapState = {
  //poolAddress for current token pairs
  swapPoolAddress: string;
  swapPoolData: any;
  swapSlippage: string;
  //true if both tokens selected, false if only one token selected
  pairSelected: boolean;
  //TokenIn defines the token on the left/up on a swap page
  tokenIn: tokenSwap;
  tokenInRangeUSDPrice: number;
  tokenInCoverUSDPrice: number;
  tokenInRangeAllowance: string;
  tokenInCoverAllowance: string;
  tokenInBalance: string;
  //TokenOut defines the token on the left/up on a swap page
  tokenOut: tokenSwap;
  tokenOutRangeUSDPrice: number;
  tokenOutCoverUSDPrice: number;
  tokenOutBalance: string;
  //Gas
  gasFee: string;
  gasLimit: BigNumber;
  mintGasFee: string;
  mintGasLimit: BigNumber;
  //refresh
  needsCoverAllowance: boolean;
  needsRangeAllowanceIn: boolean;
  needsRangeAllowanceOut: boolean;
  needsCoverBalance: boolean;
  needsRangeBalanceIn: boolean;
  needsRangeBalanceOut: boolean;
};

type SwapAction = {
  //pool
  setSwapPoolAddress: (poolAddress: string) => void;
  setSwapPoolData: (poolData: any) => void;
  setPairSelected: (pairSelected: Boolean) => void;
  //tokenIn
  setTokenIn: (tokenOut: tokenSwap, newToken: tokenSwap) => void;
  //setTokenInRangeUSDPrice: (price: number) => void;
  //setTokenInCoverUSDPrice: (price: number) => void;
  setTokenInRangeAllowance: (allowance: string) => void;
  setTokenInCoverAllowance: (allowance: string) => void;
  setTokenInBalance: (balance: string) => void;
  //tokenOut
  setTokenOut: (tokenOut: tokenSwap, newToken: tokenSwap) => void;
  //setTokenOutRangeUSDPrice: (price: number) => void;
  //setTokenOutCoverUSDPrice: (price: number) => void;
  setTokenOutBalance: (balance: string) => void;
  //gas
  setGasFee: (fee: string) => void;
  setGasLimit: (limit: BigNumber) => void;
  setMintGasFee: (fee: string) => void;
  setMintGasLimit: (limit: BigNumber) => void;
  //refresh
  setNeedsCoverAllowance: (needsAllowance: boolean) => void;
  setNeedsRangeAllowanceIn: (needsAllowance: boolean) => void;
  setNeedsRangeAllowanceOut: (needsAllowance: boolean) => void;
  setNeedsCoverBalance: (needsBalance: boolean) => void;
  setNeedsRangeBalanceIn: (needsBalance: boolean) => void;
  setNeedsRangeBalanceOut: (needsBalance: boolean) => void;
  //reset
  resetSwapParams: () => void;
};

const initialSwapState: SwapState = {
  //pools
  swapPoolAddress: "",
  swapPoolData: {},
  swapSlippage: "0.5",
  //
  pairSelected: false,
  //
  tokenIn: {
    callId: 0,
    name: "Wrapped Ether",
    symbol: "WETH",
    logoURI: "/static/images/eth_icon.png",
    address: tokenOneAddress,
    decimals: 18,
  } as tokenSwap,
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
    decimals: 18,
  } as tokenSwap,
  tokenOutRangeUSDPrice: 0,
  tokenOutCoverUSDPrice: 0,
  tokenOutBalance: "0.00",
  //
  gasFee: "$0.00",
  gasLimit: BN_ZERO,
  mintGasFee: "$0.00",
  mintGasLimit: BN_ZERO,
  //
  needsCoverAllowance: true,
  needsRangeAllowanceIn: true,
  needsRangeAllowanceOut: true,
  needsCoverBalance: true,
  needsRangeBalanceIn: true,
  needsRangeBalanceOut: true,
};

export const useSwapStore = create<SwapState & SwapAction>((set) => ({
  //pool
  swapPoolAddress: initialSwapState.swapPoolAddress,
  swapPoolData: initialSwapState.swapPoolData,
  swapSlippage: initialSwapState.swapSlippage,
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
  //refresh
  needsCoverAllowance: initialSwapState.needsCoverAllowance,
  needsRangeAllowanceIn: initialSwapState.needsRangeAllowanceIn,
  needsRangeAllowanceOut: initialSwapState.needsRangeAllowanceOut,
  needsCoverBalance: initialSwapState.needsCoverBalance,
  needsRangeBalanceIn: initialSwapState.needsRangeBalanceIn,
  needsRangeBalanceOut: initialSwapState.needsRangeBalanceOut,
  setSwapPoolAddress: (poolAddress: string) => {
    set(() => ({
      swapPoolAddress: poolAddress,
    }));
  },
  setSwapPoolData: (poolData: any) => {
    set(() => ({
      swapPoolData: poolData,
    }));
  },
  setTokenIn: (tokenOut, newToken: tokenSwap) => {
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
        set((state) => ({
          tokenIn: {
            callId:
              newToken.address.localeCompare(state.tokenOut.address) < 0
                ? 0
                : 1,
            ...newToken,
          },
          tokenOut: {
            callId:
              newToken.address.localeCompare(state.tokenOut.address) < 0
                ? 1
                : 0,
            ...state.tokenOut,
          },
          pairSelected: true,
        }));
      }
    } else {
      //if tokenOut its not selected callId is 0 because only 1 token is selected
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
  setTokenOut: (tokenIn, newToken: tokenSwap) => {
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
      //if tokenIn its not selected callId is 0 because only 1 token is selected
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

  setPairSelected: (pairSelected: boolean) => {
    set(() => ({
      pairSelected: pairSelected,
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
  setNeedsCoverAllowance: (needsCoverAllowance: boolean) => {
    set(() => ({
      needsCoverAllowance: needsCoverAllowance,
    }));
  },
  setNeedsRangeAllowanceIn: (needsRangeAllowanceIn: boolean) => {
    set(() => ({
      needsRangeAllowanceIn: needsRangeAllowanceIn,
    }));
  },
  setNeedsRangeAllowanceOut: (needsRangeAllowanceOut: boolean) => {
    set(() => ({
      needsRangeAllowanceOut: needsRangeAllowanceOut,
    }));
  },
  setNeedsCoverBalance: (needsCoverBalance: boolean) => {
    set(() => ({
      needsCoverBalance: needsCoverBalance,
    }));
  },
  setNeedsRangeBalanceIn: (needsRangeBalanceIn: boolean) => {
    set(() => ({
      needsRangeBalanceIn: needsRangeBalanceIn,
    }));
  },
  setNeedsRangeBalanceOut: (needsRangeBalanceOut: boolean) => {
    set(() => ({
      needsRangeBalanceOut: needsRangeBalanceOut,
    }));
  },
  switchDirection: () => {
    set((state) => ({
      tokenIn: {
        callId:
          state.tokenOut.address.localeCompare(state.tokenIn.address) < 0
            ? 0
            : 1,
        name: state.tokenOut.name,
        symbol: state.tokenOut.symbol,
        logoURI: state.tokenOut.logoURI,
        address: state.tokenOut.address,
        decimals: state.tokenOut.decimals,
      },
      tokenOut: {
        callId:
          state.tokenOut.address.localeCompare(state.tokenIn.address) < 0
            ? 1
            : 0,
        name: state.tokenIn.name,
        symbol: state.tokenIn.symbol,
        logoURI: state.tokenIn.logoURI,
        address: state.tokenIn.address,
        decimals: state.tokenIn.decimals,
      },
    }));
  },
  resetSwapParams: () => {
    set({
      //pools
      swapPoolAddress: initialSwapState.swapPoolAddress,
      swapPoolData: initialSwapState.swapPoolData,
      swapSlippage: initialSwapState.swapSlippage,
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
      //refresh
      needsCoverAllowance: initialSwapState.needsCoverAllowance,
      needsRangeAllowanceIn: initialSwapState.needsRangeAllowanceIn,
      needsRangeAllowanceOut: initialSwapState.needsRangeAllowanceOut,
      needsCoverBalance: initialSwapState.needsCoverBalance,
      needsRangeBalanceIn: initialSwapState.needsRangeBalanceIn,
      needsRangeBalanceOut: initialSwapState.needsRangeBalanceOut,
    });
  },
}));
