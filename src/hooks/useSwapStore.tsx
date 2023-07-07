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
  coverPoolAddress: String;
  rangePoolAddress: String;
  //true if both tokens selected, false if only one token selected
  pairSelected: Boolean;
  //TokenIn defines the token on the left/up on a swap page
  tokenIn: token;
  tokenInRangeAllowanceBigNumber: BigNumber;
  tokenInCoverAllowanceBigNumber: BigNumber;
  tokenInAmountToSendBigNumber: BigNumber;
  //TokenOut defines the token on the left/up on a swap page
  tokenOut: token;
  tokenOutRangeAllowanceBigNumber: BigNumber;
  tokenOutCoverAllowanceBigNumber: BigNumber;
  tokenOutAmountToReceiveBigNumber: BigNumber;
  //Token0 defined the token with smaller address on the swap contract call
  token0: token;
  //Token1 defines the token with higher address on the swap contract call
  token1: token;
  //Gas
  gasFee: BigNumber;
  gasLimit: BigNumber;
};

type SwapAction = {
  resetSwapParams: () => void;
};

const initialSwapState: SwapState = {
  coverPoolAddress: "",
  rangePoolAddress: "",
  pairSelected: false,
  tokenIn: {
    name: "Wrapped Ether",
    symbol: "WETH",
    logoURI: "/static/images/eth_icon.png",
    address: tokenOneAddress,
    usdPrice: 0,
  } as token,
  tokenInRangeAllowanceBigNumber: BN_ZERO,
  tokenInCoverAllowanceBigNumber: BN_ZERO,
  tokenInAmountToSendBigNumber: BN_ZERO,
  tokenOut: {
    name: "Select Token",
    symbol: "Select Token",
    logoURI: "",
    address: tokenZeroAddress,
    usdPrice: 0,
  } as token,
  tokenOutRangeAllowanceBigNumber: BN_ZERO,
  tokenOutCoverAllowanceBigNumber: BN_ZERO,
  tokenOutAmountToReceiveBigNumber: BN_ZERO,
  token0: {
    name: "",
    symbol: "",
    logoURI: "",
    address: tokenZeroAddress,
    usdPrice: 0,
  } as token,
  token1: {
    name: "",
    symbol: "",
    logoURI: "",
    address: tokenOneAddress,
    usdPrice: 0,
  } as token,
  gasFee: BN_ZERO,
  gasLimit: BN_ZERO,
};

export const useSwapStore = create<SwapState & SwapAction>((set) => ({
  coverPoolAddress: initialSwapState.coverPoolAddress,
  rangePoolAddress: initialSwapState.rangePoolAddress,
  pairSelected: initialSwapState.pairSelected,
  tokenIn: initialSwapState.tokenIn,
  tokenInRangeAllowanceBigNumber:
    initialSwapState.tokenInRangeAllowanceBigNumber,
  tokenInCoverAllowanceBigNumber:
    initialSwapState.tokenInCoverAllowanceBigNumber,
  tokenInAmountToSendBigNumber: initialSwapState.tokenInAmountToSendBigNumber,
  tokenOut: initialSwapState.tokenOut,
  tokenOutRangeAllowanceBigNumber:
    initialSwapState.tokenOutCoverAllowanceBigNumber,
  tokenOutCoverAllowanceBigNumber:
    initialSwapState.tokenOutCoverAllowanceBigNumber,
  tokenOutAmountToReceiveBigNumber:
    initialSwapState.tokenOutAmountToReceiveBigNumber,
  token0: initialSwapState.token0,
  token1: initialSwapState.token1,
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
          tokenIn: newToken,
          token0: newToken,
          tokenOut: initialSwapState.tokenOut,
          token1: initialSwapState.token1,
          pairSelected: false,
        }));
      } else {
        //if tokens are different
        set(() => ({
          tokenIn: newToken,
          token0: newToken.address < tokenOut.address ? newToken : tokenOut,
          token1: newToken.address < tokenOut.address ? tokenOut : newToken,
          pairSelected: true,
        }));
      }
    } else {
      //if tokenOut its not selected
      set(() => ({
        tokenIn: newToken,
        token0: newToken,
        pairSelected: false,
      }));
    }
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
          tokenOut: newToken,
          token0: newToken,
          tokenIn: initialSwapState.tokenOut,
          token1: initialSwapState.token1,
          pairSelected: false,
        }));
      } else {
        //if tokens are different
        set(() => ({
          tokenOut: newToken,
          token0: newToken.address < tokenIn.address ? newToken : tokenIn,
          token1: newToken.address < tokenIn.address ? tokenIn : newToken,
          pairSelected: true,
        }));
      }
    } else {
      //if tokenIn its not selected
      set(() => ({
        tokenOut: newToken,
        token0: newToken,
        pairSelected: false,
      }));
    }
  },
  setRangePoolAddress: (rangePoolAddress: string) => {
    set(() => ({
      rangePoolAddress: rangePoolAddress,
    }));
  },
  setCoverPoolAddress: (coverPoolAddress: string) => {
    set(() => ({
      coverPoolAddress: coverPoolAddress,
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
      token0: initialSwapState.token0,
      token1: initialSwapState.token1,
      gasFee: initialSwapState.gasFee,
      gasLimit: initialSwapState.gasLimit,
    });
  },
}));
