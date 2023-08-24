import { BigNumber, ethers } from "ethers";
import { tokenLimit } from "../utils/types";
import { BN_ZERO, ZERO } from "../utils/math/constants";
import {
  tokenOneAddress,
  tokenZeroAddress,
} from "../constants/contractAddresses";
import { create } from "zustand";
import { getLimitPoolFromFactory } from "../utils/queries";
import JSBI from "jsbi";

type LimitState = {
  //poolAddress for current token pairs
  limitPoolAddress: `0x${string}`;
  volatilityTierId: number;
  limitPoolData: any;
  //tickSpacing
  //claimTick
  limitPositionData: any;
  limitSwapSlippage: string;
  //TokenIn defines the token on the left/up
  tokenIn: tokenLimit;
  //TokenOut defines the token on the risght/down
  tokenOut: tokenLimit;
  //true if both tokens selected, false if only one token selected
  pairSelected: boolean;
  limitMintParams: {
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

type LimitAction = {
  //pool
  setLimitPoolAddress: (address: String) => void;
  setLimitPoolData: (data: any) => void;
  setLimitPositionData: (data: any) => void;
  //setPairSelected: (pairSelected: boolean) => void;
  //tokenIn
  setTokenIn: (tokenOut: tokenLimit, newToken: tokenLimit) => void;
  setTokenInAmount: (amount: string) => void;
  setTokenInLimitUSDPrice: (price: number) => void;
  setTokenInLimitAllowance: (allowance: string) => void;
  setTokenInBalance: (balance: string) => void;
  setLimitAmountIn: (amount: JSBI) => void;
  //tokenOut
  setTokenOut: (tokenOut: tokenLimit, newToken: tokenLimit) => void;
  setTokenOutLimitUSDPrice: (price: number) => void;
  setTokenOutBalance: (balance: string) => void;
  setTokenOutLimitAllowance: (allowance: string) => void;
  setLimitAmountOut: (amount: JSBI) => void;
  //Claim tick
  setClaimTick: (tick: number) => void;
  setMinTick: (limitPositionData, tick: BigNumber) => void;
  setMaxTick: (limitPositionData, tick: BigNumber) => void;
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
  setLimitPoolFromVolatility: (
    tokanIn: tokenLimit,
    tokenOut: tokenLimit,
    volatility: any
  ) => void;
  setMintButtonState: () => void;
};

const initialLimitState: LimitState = {
  //pools
  limitPoolAddress: "0x00",
  volatilityTierId: 0,
  limitPoolData: {},
  limitPositionData: {},
  limitSwapSlippage: "0.5",
  //this should be false in production, initial value is true because tokenAddresses are hardcoded for testing
  pairSelected: true,
  //
  tokenIn: {
    callId: 0,
    name: "Wrapped Ether",
    symbol: "WETH",
    logoURI: "/static/images/eth_icon.png",
    address: tokenOneAddress,
    decimals: 18,
    userBalance: 0.0,
    userPoolAllowance: 0.0,
    limitUSDPrice: 0.0,
  } as tokenLimit,
  //
  tokenOut: {
    callId: 1,
    name: "Select Token",
    symbol: "Select Token",
    logoURI: "",
    address: tokenZeroAddress,
    decimals: 18,
    userBalance: 0.0,
    userPoolAllowance: 0.0,
    limitUSDPrice: 0.0,
  } as tokenLimit,
  //
  claimTick: 0,
  //
  limitMintParams: {
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

export const useLimitStore = create<LimitState & LimitAction>((set) => ({
  //pool
  limitPoolAddress: initialLimitState.limitPoolAddress,
  limitPoolData: initialLimitState.limitPoolData,
  limitPositionData: initialLimitState.limitPositionData,
  limitSwapSlippage: initialLimitState.limitSwapSlippage,
  volatilityTierId: initialLimitState.volatilityTierId,
  pairSelected: initialLimitState.pairSelected,
  //tokenIn
  tokenIn: initialLimitState.tokenIn,
  //tokenOut
  tokenOut: initialLimitState.tokenOut,
  //tick
  claimTick: initialLimitState.claimTick,
  limitMintParams: initialLimitState.limitMintParams,
  needsRefetch: initialLimitState.needsRefetch,
  needsAllowance: initialLimitState.needsAllowance,
  needsBalance: initialLimitState.needsBalance,
  setTokenIn: (tokenOut, newToken: tokenLimit) => {
    //if tokenOut is selected
    if (
      tokenOut.address != initialLimitState.tokenOut.address ||
      tokenOut.symbol != "Select Token"
    ) {
      //if the new tokenIn is the same as the selected TokenOut, get TokenOut back to  initialState
      if (newToken.address == tokenOut.address) {
        set(() => ({
          tokenIn: {
            callId: 0,
            ...newToken,
          },
          tokenOut: initialLimitState.tokenOut,
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

  setTokenInLimitUSDPrice: (newPrice: number) => {
    set((state) => ({
      tokenIn: {
        ...state.tokenIn,
        limitUSDPrice: newPrice,
      },
    }));
  },

  setTokenInLimitAllowance: (newAllowance: string) => {
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
  setLimitAmountIn: (newAmount: JSBI) => {
    set((state) => ({
      limitMintParams: {
        ...state.limitMintParams,
        tokenInAmount: newAmount,
      },
    }));
  },
  setTokenOutLimitUSDPrice: (newPrice: number) => {
    set((state) => ({
      tokenOut: {
        ...state.tokenOut,
        limitUSDPrice: newPrice,
      },
    }));
  },
  setTokenOut: (tokenIn, newToken: tokenLimit) => {
    //if tokenIn exists
    if (
      tokenIn.address != initialLimitState.tokenOut.address ||
      tokenIn.symbol != "Select Token"
    ) {
      //if the new selected TokenOut is the same as the current tokenIn, erase the values on TokenIn
      if (newToken.address == tokenIn.address) {
        set(() => ({
          tokenOut: { callId: 0, ...newToken },
          tokenIn: initialLimitState.tokenOut,
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
  setTokenOutLimitAllowance: (newAllowance: string) => {
    set((state) => ({
      tokenOut: {
        ...state.tokenOut,
        userPoolAllowance: Number(newAllowance),
      },
    }));
  },
  setLimitAmountOut: (newAmount: JSBI) => {
    set((state) => ({
      limitMintParams: {
        ...state.limitMintParams,
        tokenOutAmount: newAmount,
      },
    }));
  },
  setLimitPoolAddress: (limitPoolAddress: `0x${string}`) => {
    set(() => ({
      limitPoolAddress: limitPoolAddress,
    }));
  },
  setLimitPoolData: (limitPoolData: any) => {
    set(() => ({
      limitPoolData: limitPoolData,
    }));
  },
  setLimitPositionData: (limitPositionData: any) => {
    set(() => ({
      limitPositionData: limitPositionData,
    }));
  },
  setLimitSlippage: (limitSlippage: string) => {
    set(() => ({
      limitSwapSlippage: limitSlippage,
    }));
  },
  setClaimTick: (claimTick: number) => {
    set(() => ({
      claimTick: claimTick,
    }));
  },
  setMinTick: (limitPositionData, minTick: BigNumber) => {
    const newPositionData = { ...limitPositionData };
    newPositionData.minTick = minTick;
    set(() => ({
      limitPositionData: newPositionData,
    }));
  },
  setMaxTick: (limitPositionData, maxTick: BigNumber) => {
    const newPositionData = { ...limitPositionData };
    newPositionData.maxTick = maxTick;
    set(() => ({
      limitPositionData: newPositionData,
    }));
  },
  setGasFee: (gasFee: string) => {
    set((state) => ({
      limitMintParams: {
        ...state.limitMintParams,
        gasFee: gasFee,
      },
    }));
  },
  setGasLimit: (gasLimit: BigNumber) => {
    set((state) => ({
      limitMintParams: {
        ...state.limitMintParams,
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
        decimals: state.tokenOut.decimals,
        userBalance: state.tokenOut.userBalance,
        userPoolAllowance: state.tokenOut.userPoolAllowance,
        limitUSDPrice: state.tokenOut.limitUSDPrice,
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
        userPoolAllowance: state.tokenIn.userPoolAllowance,
        limitUSDPrice: state.tokenIn.limitUSDPrice,
      },
    }));
  },
  setLimitPoolFromVolatility: async (tokenIn, tokenOut, volatility: any) => {
    try {
      const pool = await getLimitPoolFromFactory(
        tokenIn.address,
        tokenOut.address
      );
      const volatilityId = volatility.id;
      const dataLength = pool["data"]["limitPools"].length;
      for (let i = 0; i < dataLength; i++) {
        if (
          (volatilityId == 0 &&
            pool["data"]["limitPools"][i]["volatilityTier"]["tickSpread"] ==
              20) ||
          (volatilityId == 1 &&
            pool["data"]["limitPools"][i]["volatilityTier"]["tickSpread"] == 40)
        ) {
          console.log("volatility id", volatilityId);
          set(() => ({
            limitPoolAddress: pool["data"]["limitPools"][i]["id"],
            limitPoolData: pool["data"]["limitPools"][i],
            volatilityTierId: volatilityId,
          }));
        }
      }
    } catch (error) {
      console.log(error);
    }
  },
  setMintButtonState: () => {
    console.log("setMintButtonState");
    set((state) => ({
      limitMintParams: {
        ...state.limitMintParams,
        buttonMessage:
          state.tokenIn.userBalance <
          parseFloat(
            ethers.utils.formatUnits(
              String(state.limitMintParams.tokenInAmount),
              18
            )
          )
            ? "Insufficient Token Balance"
            : parseFloat(
                ethers.utils.formatUnits(
                  String(state.limitMintParams.tokenInAmount),
                  18
                )
              ) == 0
            ? "Enter Amount"
            : "Create Limit",
        disabled:
          state.tokenIn.userBalance <
          parseFloat(
            ethers.utils.formatUnits(
              String(state.limitMintParams.tokenInAmount),
              18
            )
          )
            ? true
            : parseFloat(
                ethers.utils.formatUnits(
                  String(state.limitMintParams.tokenInAmount),
                  18
                )
              ) == 0
            ? true
            : false,
      },
    }));
  },
}));
