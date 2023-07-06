import { BigNumber } from "ethers";
import { token } from "../utils/types";
import { BN_ZERO } from "../utils/math/constants";
import { tokenOneAddress } from "../constants/contractAddresses";
import { create } from "zustand";

type SwapState = {
  //poolAddresse for current token pairs
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
    symbol: "WETH",
    logoURI: "/static/images/eth_icon.png",
    address: tokenOneAddress,
    usdPrice: 0,
  } as token,
  tokenInRangeAllowanceBigNumber: BN_ZERO,
  tokenInCoverAllowanceBigNumber: BN_ZERO,
  tokenInAmountToSendBigNumber: BN_ZERO,
  tokenOut: {
    name: "",
    symbol: "",
    logoURI: "",
    address: "",
    value: "",
    usdPrice: 0,
  } as token,
  tokenOutRangeAllowanceBigNumber: BN_ZERO,
  tokenOutCoverAllowanceBigNumber: BN_ZERO,
  tokenOutAmountToReceiveBigNumber: BN_ZERO,
  token0: {
    name: "",
    symbol: "",
    logoURI: "",
    address: "",
    value: "",
    usdPrice: 0,
  } as token,
  token1: {
    name: "",
    symbol: "",
    logoURI: "",
    address: "",
    value: "",
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
