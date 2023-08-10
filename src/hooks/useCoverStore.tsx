import { BigNumber, ethers } from "ethers";
import { token, tokenCover } from "../utils/types";
import { BN_ZERO, ZERO } from "../utils/math/constants";
import {
  tokenOneAddress,
  tokenZeroAddress,
} from "../constants/contractAddresses";
import { create } from "zustand";
import { getCoverPoolFromFactory } from "../utils/queries";
import JSBI from "jsbi";

type CoverState = {
  //poolAddress for current token pairs
  coverPoolAddress: `0x${string}`;
  volatilityTierId: number;
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
    tokenInAmount: JSBI;
    tokenOutAmount: JSBI;
    gasFee: string;
    gasLimit: BigNumber;
    disabled: boolean;
    buttonMessage: string;
  };
  needsRefetch: boolean;
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
  setTokenIn: (tokenOut: token, newToken: token) => void;
  setTokenInAmount: (amount: string) => void;
  setTokenInCoverUSDPrice: (price: number) => void;
  setTokenInCoverAllowance: (allowance: string) => void;
  setTokenInBalance: (balance: string) => void;
  setCoverAmountIn: (amount: JSBI) => void;
  //tokenOut
  setTokenOut: (tokenOut: token, newToken: token) => void;
  setTokenOutCoverUSDPrice: (price: number) => void;
  setTokenOutBalance: (balance: string) => void;
  setTokenOutCoverAllowance: (allowance: string) => void;
  setCoverAmountOut: (amount: JSBI) => void;
  //Claim tick
  setClaimTick: (tick: number) => void;
  setMinTick: (coverPositionData, tick: BigNumber) => void;
  setMaxTick: (coverPositionData, tick: BigNumber) => void;
  //gas
  setGasFee: (fee: string) => void;
  setGasLimit: (limit: BigNumber) => void;
  //refetch
  setNeedsRefetch: (needsRefetch: boolean) => void;
  //allowance
  setNeedsAllowance: (needsAllowance: boolean) => void;
  //balance
  setNeedsBalance: (needsBalance: boolean) => void;
  //reset
  switchDirection: () => void;
  setCoverPoolFromVolatility: (
    tokenIn: token,
    tokenOut: token,
    volatility: any
  ) => void;
  setMintButtonState: () => void;
};

const initialCoverState: CoverState = {
  //pools
  coverPoolAddress: "0x00",
  volatilityTierId: 0,
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
    address: tokenOneAddress,
    userBalance: 0.0,
    userPoolAllowance: 0.0,
    coverUSDPrice: 0.0,
  } as tokenCover,
  //
  tokenOut: {
    callId: 1,
    name: "Select Token",
    symbol: "Select Token",
    logoURI: "",
    address: tokenZeroAddress,
    userBalance: 0.0,
    userPoolAllowance: 0.0,
    coverUSDPrice: 0.0,
  } as tokenCover,
  //
  claimTick: 0,
  //
  coverMintParams: {
    tokenInAmount: ZERO,
    tokenOutAmount: ZERO,
    gasFee: "$0.00",
    gasLimit: BN_ZERO,
    disabled: true,
    buttonMessage: "",
  },
  needsRefetch: false,
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
  volatilityTierId: initialCoverState.volatilityTierId,
  pairSelected: initialCoverState.pairSelected,
  //tokenIn
  tokenIn: initialCoverState.tokenIn,
  //tokenOut
  tokenOut: initialCoverState.tokenOut,
  //tick
  claimTick: initialCoverState.claimTick,
  coverMintParams: initialCoverState.coverMintParams,
  needsRefetch: initialCoverState.needsRefetch,
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
  setTokenInAmount: (newAmount: string) => {
    set((state) => ({
      tokenIn: {
        ...state.tokenIn,
        userBalance: Number(newAmount),
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
        userPoolAllowance: Number(newAllowance),
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
  setCoverAmountIn: (newAmount: JSBI) => {
    set((state) => ({
      coverMintParams: {
        ...state.coverMintParams,
        tokenInAmount: newAmount,
      },
    }));
  },
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
        userPoolAllowance: Number(newAllowance),
      },
    }));
  },
  setCoverAmountOut: (newAmount: JSBI) => {
    set((state) => ({
      coverMintParams: {
        ...state.coverMintParams,
        tokenOutAmount: newAmount,
      },
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
        userBalance: state.tokenOut.userBalance,
        userPoolAllowance: state.tokenOut.userPoolAllowance,
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
        userBalance: state.tokenIn.userBalance,
        userPoolAllowance: state.tokenIn.userPoolAllowance,
        coverUSDPrice: state.tokenIn.coverUSDPrice,
      },
    }));
  },
  setCoverPoolFromVolatility: async (tokenIn, tokenOut, volatility: any) => {
    try {
      const pool = await getCoverPoolFromFactory(
        tokenIn.address,
        tokenOut.address
      );
      const volatilityId = volatility.id;
      const dataLength = pool["data"]["coverPools"].length;
      for (let i = 0; i < dataLength; i++) {
        if (
          (volatilityId == 0 &&
            pool["data"]["coverPools"][i]["volatilityTier"]["tickSpread"] ==
              20) ||
          (volatilityId == 1 &&
            pool["data"]["coverPools"][i]["volatilityTier"]["tickSpread"] == 40)
        ) {
          set(() => ({
            coverPoolAddress: pool["data"]["coverPools"][i]["id"],
            coverPoolData: pool["data"]["coverPools"][i],
            volatilityTierId: volatilityId,
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
              18
            )
          )
            ? "Insufficient Token Balance"
            : parseFloat(
                ethers.utils.formatUnits(
                  String(state.coverMintParams.tokenInAmount),
                  18
                )
              ) == 0
            ? "Enter Amount"
            : "Create Cover",
        disabled:
          state.tokenIn.userBalance <
          parseFloat(
            ethers.utils.formatUnits(
              String(state.coverMintParams.tokenInAmount),
              18
            )
          )
            ? true
            : parseFloat(
                ethers.utils.formatUnits(
                  String(state.coverMintParams.tokenInAmount),
                  18
                )
              ) == 0
            ? true
            : false,
      },
    }));
  },
}));
