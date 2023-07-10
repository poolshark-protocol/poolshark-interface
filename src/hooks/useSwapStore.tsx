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
  ////range
  rangePoolAddress: String;
  rangePoolData: any;
  //true if both tokens selected, false if only one token selected
  pairSelected: Boolean;
  //TokenIn defines the token on the left/up on a swap page
  tokenIn: token;
  tokenInRangeUSDPrice: number;
  tokenInCoverUSDPrice: number;
  tokenInRangeAllowanceBigNumber: BigNumber;
  tokenInCoverAllowanceBigNumber: BigNumber;
  tokenInAmountToSendBigNumber: BigNumber;
  //TokenOut defines the token on the left/up on a swap page
  tokenOut: token;
  tokenOutRangeUSDPrice: Number;
  tokenOutCoverUSDPrice: Number;
  tokenOutRangeAllowanceBigNumber: BigNumber;
  tokenOutCoverAllowanceBigNumber: BigNumber;
  tokenOutAmountToReceiveBigNumber: BigNumber;
  //Gas
  gasFee: BigNumber;
  gasLimit: BigNumber;
};

type SwapAction = {
  resetSwapParams: () => void;
};

const initialSwapState: SwapState = {
  //
  coverPoolAddress: "",
  coverPoolData: {},
  rangePoolAddress: "",
  rangePoolData: {},
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
  tokenInCoverUSDPrice: 0,
  tokenInRangeAllowanceBigNumber: BN_ZERO,
  tokenInCoverAllowanceBigNumber: BN_ZERO,
  tokenInAmountToSendBigNumber: BN_ZERO,
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
  tokenOutRangeAllowanceBigNumber: BN_ZERO,
  tokenOutCoverAllowanceBigNumber: BN_ZERO,
  tokenOutAmountToReceiveBigNumber: BN_ZERO,
  //
  gasFee: BN_ZERO,
  gasLimit: BN_ZERO,
};

console.log('tokenIn', initialSwapState.tokenIn);
console.log('tokenOut', initialSwapState.tokenOut);

export const useSwapStore = create<SwapState & SwapAction>((set) => ({
  coverPoolAddress: initialSwapState.coverPoolAddress,
  coverPoolData: initialSwapState.coverPoolData,
  rangePoolAddress: initialSwapState.rangePoolAddress,
  rangePoolData: initialSwapState.rangePoolData,
  pairSelected: initialSwapState.pairSelected,
  tokenIn: initialSwapState.tokenIn,
  tokenInRangeUSDPrice: initialSwapState.tokenInRangeUSDPrice,
  tokenInCoverUSDPrice: initialSwapState.tokenInCoverUSDPrice,
  tokenInRangeAllowanceBigNumber:
    initialSwapState.tokenInRangeAllowanceBigNumber,
  tokenInCoverAllowanceBigNumber:
    initialSwapState.tokenInCoverAllowanceBigNumber,
  tokenInAmountToSendBigNumber: initialSwapState.tokenInAmountToSendBigNumber,
  tokenOut: initialSwapState.tokenOut,
  tokenOutRangeUSDPrice: initialSwapState.tokenOutRangeUSDPrice,
  tokenOutCoverUSDPrice: initialSwapState.tokenOutCoverUSDPrice,
  tokenOutRangeAllowanceBigNumber:
    initialSwapState.tokenOutCoverAllowanceBigNumber,
  tokenOutCoverAllowanceBigNumber:
    initialSwapState.tokenOutCoverAllowanceBigNumber,
  tokenOutAmountToReceiveBigNumber:
    initialSwapState.tokenOutAmountToReceiveBigNumber,
  gasFee: initialSwapState.gasFee,
  gasLimit: initialSwapState.gasLimit,
  setTokenIn: (tokenOut, newToken: token) => {
    console.log("store setTokenIn");
    console.log("store tokenIn", newToken);

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
  setTokenInCoverUSDPrice: (newPrice: number) => {
    set(() => ({
      tokenInCoverUSDPrice: newPrice,
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
    console.log("store setTokenOut");
    console.log("store tokenOut", newToken);
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
  switchDirection: () => {
    set((state) => ({
      tokenIn: state.tokenOut,
      tokenOut: state.tokenIn,
    }));
  },
  resetSwapParams: () => {
    set({
      coverPoolAddress: initialSwapState.coverPoolAddress,
      rangePoolAddress: initialSwapState.rangePoolAddress,
      pairSelected: initialSwapState.pairSelected,
      tokenIn: initialSwapState.tokenIn,
      tokenInRangeAllowanceBigNumber:
        initialSwapState.tokenInRangeAllowanceBigNumber,
      tokenInCoverAllowanceBigNumber:
        initialSwapState.tokenInCoverAllowanceBigNumber,
      tokenInAmountToSendBigNumber:
        initialSwapState.tokenInAmountToSendBigNumber,
      tokenOut: initialSwapState.tokenOut,
      tokenOutRangeAllowanceBigNumber:
        initialSwapState.tokenOutCoverAllowanceBigNumber,
      tokenOutCoverAllowanceBigNumber:
        initialSwapState.tokenOutCoverAllowanceBigNumber,
      tokenOutAmountToReceiveBigNumber:
        initialSwapState.tokenOutAmountToReceiveBigNumber,
      gasFee: initialSwapState.gasFee,
      gasLimit: initialSwapState.gasLimit,
    });
  },
}));
