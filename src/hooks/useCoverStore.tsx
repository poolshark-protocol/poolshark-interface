import { BigNumber, ethers } from "ethers";
import { tokenCover } from "../utils/types";
import { BN_ZERO, ZERO_ADDRESS } from "../utils/math/constants";
import {
  tokenOneAddress,
  tokenZeroAddress,
} from "../constants/contractAddresses";
import { create } from "zustand";
import { getCoverPoolFromFactory } from "../utils/queries";

type CoverState = {
  //poolAddress for current token pairs
  coverPoolAddress: `0x${string}`;
  coverPoolData: any;
  //tickSpacing
  //claimTick
  coverPositionData: any;
  coverSwapSlippage: string;
  //TokenIn defines the token on the left/up
  tokenIn: tokenCover;
  //TokenOut defines the token on the risght/down
  tokenOut: tokenCover;
  //true if both tokens selected, false if only one token selected
  pairSelected: boolean;
  coverMintParams: {
    tokenInAmount: BigNumber;
    tokenOutAmount: BigNumber;
    gasFee: string;
    gasLimit: BigNumber;
    disabled: boolean;
    buttonMessage: string;
  };
  needsRefetch: boolean;
  needsPosRefetch: boolean;
  needsAllowance: boolean;
  needsBalance: boolean;
  //Claim tick
  claimTick: number;
  //Bcontract calls
};

type CoverAction = {
  //pool
  setCoverPoolAddress: (address: String) => void;
  setCoverPoolData: (data: any) => void;
  setCoverPositionData: (data: any) => void;
  //setPairSelected: (pairSelected: boolean) => void;
  //tokenIn
  setTokenIn: (tokenOut: tokenCover, newToken: tokenCover) => void;
  setTokenInAmount: (amount: BigNumber) => void;
  setTokenInCoverUSDPrice: (price: number) => void;
  setTokenInCoverAllowance: (allowance: string) => void;
  setTokenInBalance: (balance: string) => void;
  //setCoverAmountIn: (amount: BigNumber) => void;
  //tokenOut
  setTokenOut: (tokenOut: tokenCover, newToken: tokenCover) => void;
  setTokenOutAmount: (amount: BigNumber) => void;
  setTokenOutCoverUSDPrice: (price: number) => void;
  setTokenOutBalance: (balance: string) => void;
  setTokenOutCoverAllowance: (allowance: string) => void;
  //setCoverAmountOut: (amount: JSBI) => void;
  //Claim tick
  setClaimTick: (tick: number) => void;
  setMinTick: (coverPositionData, tick: BigNumber) => void;
  setMaxTick: (coverPositionData, tick: BigNumber) => void;
  //gas
  setGasFee: (fee: string) => void;
  setGasLimit: (limit: BigNumber) => void;
  //refetch
  setNeedsRefetch: (needsRefetch: boolean) => void;
  setNeedsPosRefetch: (needsPosRefetch: boolean) => void;
  //allowance
  setNeedsAllowance: (needsAllowance: boolean) => void;
  //balance
  setNeedsBalance: (needsBalance: boolean) => void;
  //reset
  switchDirection: () => void;
  setCoverPoolFromVolatility: (
    tokenIn: tokenCover,
    tokenOut: tokenCover,
    volatility: any
  ) => void;
  setMintButtonState: () => void;
};

const initialCoverState: CoverState = {
  //pools
  coverPoolAddress: ZERO_ADDRESS as `0x${string}`,
  coverPoolData: {},
  coverPositionData: {},
  coverSwapSlippage: "0.5",
  //this should be false in production, initial value is true because tokenAddresses are hardcoded for testing
  pairSelected: true,
  //
  tokenIn: {
    callId: 0,
    name: "Wrapped Ether",
    symbol: "WETH",
    logoURI: "/static/images/eth_icon.png",
    address: tokenZeroAddress,
    decimals: 18,
    userBalance: 0.0,
    userRouterAllowance: 0.0,
    coverUSDPrice: 0.0,
  } as tokenCover,
  //
  tokenOut: {
    callId: 1,
    name: "DAI",
    symbol: "DAI",
    logoURI: "/static/images/dai_icon.png",
    address: tokenOneAddress,
    decimals: 18,
    userBalance: 0.0,
    userRouterAllowance: 0.0,
    coverUSDPrice: 0.0,
  } as tokenCover,
  //
  claimTick: 0,
  //
  coverMintParams: {
    tokenInAmount: BN_ZERO,
    tokenOutAmount: BN_ZERO,
    gasFee: "$0.00",
    gasLimit: BN_ZERO,
    disabled: true,
    buttonMessage: "",
  },
  needsRefetch: false,
  needsPosRefetch: false,
  needsAllowance: true,
  needsBalance: true,
  //
};

export const useCoverStore = create<CoverState & CoverAction>((set) => ({
  //pool
  coverPoolAddress: initialCoverState.coverPoolAddress,
  coverPoolData: initialCoverState.coverPoolData,
  coverPositionData: initialCoverState.coverPositionData,
  coverSwapSlippage: initialCoverState.coverSwapSlippage,
  pairSelected: initialCoverState.pairSelected,
  //tokenIn
  tokenIn: initialCoverState.tokenIn,
  //tokenOut
  tokenOut: initialCoverState.tokenOut,
  //tick
  claimTick: initialCoverState.claimTick,
  coverMintParams: initialCoverState.coverMintParams,
  needsRefetch: initialCoverState.needsRefetch,
  needsPosRefetch: initialCoverState.needsPosRefetch,
  needsAllowance: initialCoverState.needsAllowance,
  needsBalance: initialCoverState.needsBalance,
  setTokenIn: (tokenOut, newToken: tokenCover) => {
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
  setTokenInAmount: (newAmount: BigNumber) => {
    set((state) => ({
      coverMintParams: {
        ...state.coverMintParams,
        tokenInAmount: newAmount,
      },
    }));
  },
  setTokenInCoverUSDPrice: (newPrice: number) => {
    set((state) => ({
      tokenIn: {
        ...state.tokenIn,
        coverUSDPrice: newPrice,
      },
    }));
  },

  setTokenInCoverAllowance: (newAllowance: string) => {
    set((state) => ({
      tokenIn: {
        ...state.tokenIn,
        userRouterAllowance: Number(newAllowance),
      },
    }));
  },
  setTokenInBalance: (newBalance: string) => {
    set((state) => ({
      tokenIn: {
        ...state.tokenIn,
        userBalance: Number(newBalance),
      },
    }));
  },
  /* setCoverAmountIn: (newAmount: BigNumber) => {
    set((state) => ({
      coverMintParams: {
        ...state.coverMintParams,
        tokenInAmount: newAmount,
      },
    }));
  }, */
  setTokenOutCoverUSDPrice: (newPrice: number) => {
    set((state) => ({
      tokenOut: {
        ...state.tokenOut,
        coverUSDPrice: newPrice,
      },
    }));
  },
  setTokenOut: (tokenIn, newToken: tokenCover) => {
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
  setTokenOutAmount: (newAmount: BigNumber) => {
    set((state) => ({
      coverMintParams: {
        ...state.coverMintParams,
        tokenOutAmount: newAmount,
      },
    }));
  },
  setTokenOutBalance: (newBalance: string) => {
    set((state) => ({
      tokenOut: {
        ...state.tokenOut,
        userBalance: Number(newBalance),
      },
    }));
  },
  setTokenOutCoverAllowance: (newAllowance: string) => {
    set((state) => ({
      tokenOut: {
        ...state.tokenOut,
        userRouterAllowance: Number(newAllowance),
      },
    }));
  },
  /* setCoverAmountOut: (newAmount: JSBI) => {
    set((state) => ({
      coverMintParams: {
        ...state.coverMintParams,
        tokenOutAmount: newAmount,
      },
    }));
  }, */
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
  setCoverPositionData: (coverPositionData: any) => {
    set(() => ({
      coverPositionData: coverPositionData,
    }));
  },
  setCoverSlippage: (coverSlippage: string) => {
    set(() => ({
      coverSwapSlippage: coverSlippage,
    }));
  },
  setClaimTick: (claimTick: number) => {
    set(() => ({
      claimTick: claimTick,
    }));
  },
  setMinTick: (coverPositionData, minTick: BigNumber) => {
    const newPositionData = { ...coverPositionData };
    newPositionData.minTick = minTick;
    set(() => ({
      coverPositionData: newPositionData,
    }));
  },
  setMaxTick: (coverPositionData, maxTick: BigNumber) => {
    const newPositionData = { ...coverPositionData };
    newPositionData.maxTick = maxTick;
    set(() => ({
      coverPositionData: newPositionData,
    }));
  },
  setGasFee: (gasFee: string) => {
    set((state) => ({
      coverMintParams: {
        ...state.coverMintParams,
        gasFee: gasFee,
      },
    }));
  },
  setGasLimit: (gasLimit: BigNumber) => {
    set((state) => ({
      coverMintParams: {
        ...state.coverMintParams,
        gasLimit: gasLimit,
      },
    }));
  },
  setNeedsRefetch: (needsRefetch: boolean) => {
    set(() => ({
      needsRefetch: needsRefetch,
    }));
  },
  setNeedsPosRefetch: (needsPosRefetch: boolean) => {
    set(() => ({
      needsPosRefetch: needsPosRefetch,
    }));
  },
  setNeedsAllowance: (needsAllowance: boolean) => {
    set(() => ({
      needsAllowance: needsAllowance,
    }));
  },
  setNeedsBalance: (needsBalance: boolean) => {
    set(() => ({
      needsBalance: needsBalance,
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
        userBalance: state.tokenOut.userBalance,
        userRouterAllowance: state.tokenOut.userRouterAllowance,
        coverUSDPrice: state.tokenOut.coverUSDPrice,
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
        userBalance: state.tokenIn.userBalance,
        userRouterAllowance: state.tokenIn.userRouterAllowance,
        coverUSDPrice: state.tokenIn.coverUSDPrice,
      },
      needsAllowance: true,
    }));
  },
  setCoverPoolFromVolatility: async (tokenIn, tokenOut, volatility: any) => {
    try {
      const pool = await getCoverPoolFromFactory(
        tokenIn.address,
        tokenOut.address
      );
      const dataLength = pool["data"]["coverPools"].length;
      for (let i = 0; i < dataLength; i++) {
        if (
          pool["data"]["coverPools"][i]["volatilityTier"]["feeAmount"] ==
          volatility
        ) {
          set(() => ({
            coverPoolAddress: pool["data"]["coverPools"][i]["id"],
            coverPoolData: pool["data"]["coverPools"][i],
          }));
        }
      }
    } catch (error) {
      console.log(error);
    }
  },
  setMintButtonState: () => {
    set((state) => ({
      coverMintParams: {
        ...state.coverMintParams,
        buttonMessage:
          state.tokenIn.userBalance <
          parseFloat(
            ethers.utils.formatUnits(
              String(state.coverMintParams.tokenInAmount),
              state.tokenIn.decimals
            )
          )
            ? "Insufficient Token Balance"
            : parseFloat(
                ethers.utils.formatUnits(
                  String(state.coverMintParams.tokenInAmount),
                  state.tokenIn.decimals
                )
              ) == 0
            ? "Enter Amount"
            : "Mint Cover Position",
        disabled:
          state.tokenIn.userBalance <
          parseFloat(
            ethers.utils.formatUnits(
              String(state.coverMintParams.tokenInAmount),
              state.tokenIn.decimals
            )
          )
            ? true
            : parseFloat(
                ethers.utils.formatUnits(
                  String(state.coverMintParams.tokenInAmount),
                  state.tokenIn.decimals
                )
              ) == 0
            ? true
            : false,
      },
    }));
  },
}));
