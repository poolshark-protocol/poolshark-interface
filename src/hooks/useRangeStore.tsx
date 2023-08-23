import { BigNumber, ethers } from "ethers";
import { tokenRange } from "../utils/types";
import { BN_ZERO, ZERO } from "../utils/math/constants";
import {
  tokenOneAddress,
  tokenZeroAddress,
} from "../constants/contractAddresses";
import { create } from "zustand";
import { getRangePoolFromFactory } from "../utils/queries";
import JSBI from "jsbi";

type RangeState = {
  //poolAddress for current token pairs
  ////range
  rangePoolAddress: `0x${string}`;
  //rangePoolData contains all the info about the pool
  rangePoolData: any;
  feeTierId: number;
  rangeSlippage: string;
  //Range position data containing all the info about the position
  rangePositionData: any;
  //true if both tokens selected, false if only one token selected
  pairSelected: boolean;
  //TokenIn defines the token on the left/up on a swap page
  tokenIn: tokenRange;
  //TokenOut defines the token on the left/up on a swap page
  tokenOut: tokenRange;
  //min and max price input
  minInput: string;
  maxInput: string;
  rangeMintParams: {
    tokenInAmount: BigNumber;
    tokenOutAmount: BigNumber;
    gasFee: string;
    gasLimit: BigNumber;
    disabled: boolean;
    buttonMessage: string;
  };
  //refresh
  needsRefetch: boolean;
  needsPosRefetch: boolean;
  needsAllowanceIn: boolean;
  needsAllowanceOut: boolean;
  needsBalanceIn: boolean;
  needsBalanceOut: boolean;
};

type RangeAction = {
  //
  setRangePoolAddress: (address: String) => void;
  setRangePoolData: (data: any) => void;
  setRangeSlippage: (rangeSlippage: string) => void;
  setRangePositionData: (rangePosition: any) => void;
  //
  setPairSelected: (pairSelected: boolean) => void;
  //
  setTokenIn: (tokenOut: any, newToken: any) => void;
  setTokenInAmount: (amount: BigNumber) => void;
  setTokenInRangeUSDPrice: (price: number) => void;
  setTokenInRangeAllowance: (allowance: string) => void;
  setTokenInBalance: (balance: string) => void;
  //
  setTokenOut: (tokenIn: any, newToken: any) => void;
  setTokenOutAmount: (amount: BigNumber) => void;
  setTokenOutRangeUSDPrice: (price: number) => void;
  setTokenOutRangeAllowance: (allowance: string) => void;
  setTokenOutBalance: (balance: string) => void;
  //
  setMinInput: (newMinTick: string) => void;
  setMaxInput: (newMaxTick: string) => void;
  //
  setGasFee: (gasFee: string) => void;
  setGasLimit: (gasLimit: BigNumber) => void;
  //
  switchDirection: () => void;
  setRangePoolFromVolatility: (
    tokenIn: any,
    tokenOut: any,
    volatility: any
  ) => void;
  resetRangeParams: () => void;
  //
  setMintButtonState: () => void;
  //
  setNeedsRefetch: (needsRefetch: boolean) => void;
  setNeedsPosRefetch: (needsPosRefetch: boolean) => void;
  setNeedsAllowanceIn: (needsAllowance: boolean) => void;
  setNeedsAllowanceOut: (needsAllowance: boolean) => void;
  setNeedsBalanceIn: (needsBalance: boolean) => void;
  setNeedsBalanceOut: (needsBalance: boolean) => void;
};

const initialRangeState: RangeState = {
  //pools
  rangePoolAddress: "0x000",
  rangePoolData: {},
  rangePositionData: {},
  feeTierId: 0,
  rangeSlippage: "0.5",
  //
  //this should be false in production, initial value is true because tokenAddresses are hardcoded for testing
  pairSelected: false,
  //
  tokenIn: {
    callId: 0,
    name: "Wrapped Ether",
    symbol: "WETH",
    logoURI: "/static/images/eth_icon.png",
    address: tokenOneAddress,
    decimals: 18,
    userBalance: 0.0,
    userPoolAllowance: 0,
    rangeUSDPrice: 0.0,
  } as tokenRange,
  //
  tokenOut: {
    callId: 1,
    name: "Select Token",
    symbol: "Select Token",
    logoURI: "",
    address: tokenZeroAddress,
    decimals: 18,
    userBalance: 0.0,
    userPoolAllowance: 0,
    rangeUSDPrice: 0.0,
  } as tokenRange,
  //
  minInput: "",
  maxInput: "",
  //
  rangeMintParams: {
    tokenInAmount: BN_ZERO,
    tokenOutAmount: BN_ZERO,
    gasFee: "$0.00",
    gasLimit: BN_ZERO,
    disabled: true,
    buttonMessage: "",
  },
  //
  needsRefetch: false,
  needsPosRefetch: false,
  needsAllowanceIn: true,
  needsAllowanceOut: true,
  needsBalanceIn: true,
  needsBalanceOut: true,
};

export const useRangeStore = create<RangeState & RangeAction>((set) => ({
  //pool
  rangePoolAddress: initialRangeState.rangePoolAddress,
  rangePoolData: initialRangeState.rangePoolData,
  feeTierId: initialRangeState.feeTierId,
  rangeSlippage: initialRangeState.rangeSlippage,
  //true if both tokens selected, false if only one token selected
  pairSelected: initialRangeState.pairSelected,
  //tokenIn
  tokenIn: initialRangeState.tokenIn,
  //tokenOut
  tokenOut: initialRangeState.tokenOut,
  //input amounts
  minInput: initialRangeState.minInput,
  maxInput: initialRangeState.maxInput,
  //range position data
  rangePositionData: initialRangeState.rangePositionData,
  //
  rangeMintParams: initialRangeState.rangeMintParams,
  //refresh
  needsRefetch: initialRangeState.needsRefetch,
  needsPosRefetch: initialRangeState.needsPosRefetch,
  needsAllowanceIn: initialRangeState.needsAllowanceIn,
  needsAllowanceOut: initialRangeState.needsAllowanceOut,
  needsBalanceIn: initialRangeState.needsBalanceIn,
  needsBalanceOut: initialRangeState.needsBalanceOut,
  //actions
  setPairSelected: (pairSelected: boolean) => {
    set(() => ({
      pairSelected: pairSelected,
    }));
  },
  setTokenIn: (tokenOut, newToken: tokenRange) => {
    //if tokenOut is selected
    if (
      tokenOut.address != initialRangeState.tokenOut.address ||
      tokenOut.symbol != "Select Token"
    ) {
      //if the new tokenIn is the same as the selected TokenOut, get TokenOut back to  initialState
      if (newToken.address == tokenOut.address) {
        set(() => ({
          tokenIn: {
            callId: 0,
            ...newToken,
          },
          tokenOut: initialRangeState.tokenOut,
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
    //TODO this should also go to mint params
    set((state) => ({
      tokenIn: { ...state.tokenIn, amount: newAmount },
    }));
  },
  setTokenInRangeUSDPrice: (newPrice: number) => {
    set((state) => ({
      tokenIn: { ...state.tokenIn, rangeUSDPrice: newPrice },
    }));
  },
  setTokenInRangeAllowance: (newAllowance: string) => {
    set((state) => ({
      tokenIn: { ...state.tokenIn, userPoolAllowance: Number(newAllowance) },
    }));
  },
  setTokenInBalance: (newBalance: string) => {
    set((state) => ({
      tokenIn: { ...state.tokenIn, userBalance: Number(newBalance) },
    }));
  },
  setTokenOutRangeUSDPrice: (newPrice: number) => {
    set((state) => ({
      tokenOut: { ...state.tokenOut, rangeUSDPrice: newPrice },
    }));
  },
  setTokenOut: (tokenIn, newToken: tokenRange) => {
    //if tokenIn exists
    if (
      tokenIn.address != initialRangeState.tokenOut.address ||
      tokenIn.symbol != "Select Token"
    ) {
      //if the new selected TokenOut is the same as the current tokenIn, erase the values on TokenIn
      if (newToken.address == tokenIn.address) {
        set(() => ({
          tokenOut: { callId: 0, ...newToken },
          tokenIn: initialRangeState.tokenOut,
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
      rangeMintParams: {
        ...state.rangeMintParams,
        tokenOutAmount: newAmount,
      },
    }));
  },
  setTokenOutBalance: (newBalance: string) => {
    set((state) => ({
      tokenOut: { ...state.tokenOut, userBalance: Number(newBalance) },
    }));
  },
  setTokenOutRangeAllowance: (newAllowance: string) => {
    set((state) => ({
      tokenOut: { ...state.tokenOut, userPoolAllowance: Number(newAllowance) },
    }));
  },
  setMinInput: (minInput: string) => {
    set(() => ({
      minInput: minInput,
    }));
  },
  setMaxInput: (maxInput: string) => {
    set(() => ({
      maxInput: maxInput,
    }));
  },
  setRangePoolAddress: (rangePoolAddress: `0x${string}`) => {
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
  setGasFee: (gasFee: string) => {
    set((state) => ({
      rangeMintParams: {
        ...state.rangeMintParams,
        gasFee: gasFee,
      },
    }));
  },
  setGasLimit: (gasLimit: BigNumber) => {
    set((state) => ({
      rangeMintParams: {
        ...state.rangeMintParams,
        gasLimit: gasLimit,
      },
    }));
  },
  setRangePositionData: (rangePositionData: any) => {
    set(() => ({
      rangePositionData: rangePositionData,
    }));
  },
  setMintButtonState: () => {
    set((state) => ({
      rangeMintParams: {
        ...state.rangeMintParams,
        buttonMessage:
          state.tokenIn.userBalance <
          parseFloat(
            ethers.utils.formatUnits(
              String(state.rangeMintParams.tokenInAmount),
              18
            )
          )
            ? "Insufficient Token Balance"
            : parseFloat(
                ethers.utils.formatUnits(
                  String(state.rangeMintParams.tokenInAmount),
                  18
                )
              ) == 0
            ? "Enter Amount"
            : "Create Cover",
        disabled:
          state.tokenIn.userBalance <
          parseFloat(
            ethers.utils.formatUnits(
              String(state.rangeMintParams.tokenInAmount),
              18
            )
          )
            ? true
            : parseFloat(
                ethers.utils.formatUnits(
                  String(state.rangeMintParams.tokenInAmount),
                  18
                )
              ) == 0
            ? true
            : false,
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
  setNeedsAllowanceIn: (needsAllowanceIn: boolean) => {
    set(() => ({
      needsAllowanceIn: needsAllowanceIn,
    }));
  },
  setNeedsAllowanceOut: (needsAllowanceOut: boolean) => {
    set(() => ({
      needsAllowanceIn: needsAllowanceOut,
    }));
  },
  setNeedsBalanceIn: (needsBalanceIn: boolean) => {
    set(() => ({
      needsBalanceIn: needsBalanceIn,
    }));
  },
  setNeedsBalanceOut: (needsBalanceOut: boolean) => {
    set(() => ({
      needsBalanceOut: needsBalanceOut,
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
        rangeUSDPrice: state.tokenOut.rangeUSDPrice,
        userBalance: state.tokenOut.userBalance,
        userPoolAllowance: state.tokenOut.userPoolAllowance,
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
        rangeUSDPrice: state.tokenIn.rangeUSDPrice,
        userBalance: state.tokenIn.userBalance,
        userPoolAllowance: state.tokenIn.userPoolAllowance,
      },
    }));
  },
  setRangePoolFromVolatility: async (tokenIn, tokenOut, volatility: any) => {
    try {
      const pool = await getRangePoolFromFactory(
        tokenIn.address,
        tokenOut.address
      );
      const volatilityId = volatility.id;
      const dataLength = pool["data"]["rangePools"].length;
      for (let i = 0; i < dataLength; i++) {
        if (
          (volatilityId == 0 &&
            pool["data"]["rangePools"][i]["feeTier"]["feeAmount"] == "500") ||
          (volatilityId == 1 &&
            pool["data"]["rangePools"][i]["feeTier"]["feeAmount"] == "3000") ||
          (volatilityId == 2 &&
            pool["data"]["rangePools"][i]["feeTier"]["feeAmount"] == "10000")
        ) {
          set(() => ({
            rangePoolAddress: pool["data"]["rangePools"][i]["id"],
            rangePoolData: pool["data"]["rangePools"][i],
            feeTierId: volatilityId,
          }));
        }
      }
    } catch (error) {
      console.log(error);
    }
  },
  resetRangeParams: () => {
    set({
      //pool & pair
      rangePoolAddress: initialRangeState.rangePoolAddress,
      rangePoolData: initialRangeState.rangePoolData,
      rangeSlippage: initialRangeState.rangeSlippage,
      pairSelected: initialRangeState.pairSelected,
      //tokenIn
      tokenIn: initialRangeState.tokenIn,
      //tokenOut
      tokenOut: initialRangeState.tokenOut,
      //input amounts
      minInput: initialRangeState.minInput,
      maxInput: initialRangeState.maxInput,
      //position data
      rangePositionData: initialRangeState.rangePositionData,
      //refresh
      needsAllowanceIn: initialRangeState.needsAllowanceIn,
      needsAllowanceOut: initialRangeState.needsAllowanceOut,
      needsBalanceIn: initialRangeState.needsBalanceIn,
      needsBalanceOut: initialRangeState.needsBalanceOut,
      needsRefetch: initialRangeState.needsRefetch,
      needsPosRefetch: initialRangeState.needsPosRefetch,
    });
  },
}));
