import { BigNumber, ethers } from "ethers";
import { tokenRangeLimit, tokenSwap } from "../utils/types";
import { BN_ZERO } from "../utils/math/constants";
import {
  tokenOneAddress,
  tokenZeroAddress,
} from "../constants/contractAddresses";
import { create } from "zustand";
import {
  getLimitPoolFromFactory,
  getRangePoolFromFactory,
} from "../utils/queries";

type TradeState = {
  poolRouterAddresses: {
    arbitrumGoerli: string;
    arbitrumMainnet: string;
  };
  //tradePoolAddress for current token pairs
  tradePoolAddress: `0x${string}`;
  //tradePoolData contains all the info about the pool
  tradePoolData: any;
  feeTierTradeId: number;
  tradeSlippage: string;
  //Trade position data containing all the info about the position
  tradePositionData: any;
  //trade params for minting position
  tradeMintParams: {
    tokenInAmount: BigNumber;
    tokenOutAmount: BigNumber;
    gasFee: string;
    gasLimit: BigNumber;
    disabled: boolean;
    buttonMessage: string;
  };
  //true if both tokens selected, false if only one token selected
  pairSelected: boolean;
  //TokenIn defines the token on the left/up on a swap page
  tokenIn: tokenSwap;
  //TokenOut defines the token on the left/up on a swap page
  tokenOut: tokenSwap;
  //min and max price input
  minInput: string;
  maxInput: string;
  //refresh
  needsRefetch: boolean;
  needsPosRefetch: boolean;
  needsAllowanceIn: boolean;
  needsAllowanceOut: boolean;
  needsBalanceIn: boolean;
  needsBalanceOut: boolean;
};

type TradeLimitAction = {
  //
  setTradePoolAddress: (address: String) => void;
  setTradePoolData: (data: any) => void;
  setTradeSlippage: (tradeSlippage: string) => void;
  setTradePositionData: (tradePosition: any) => void;
  //
  setPairSelected: (pairSelected: boolean) => void;
  //
  setTokenIn: (tokenOut: any, newToken: any) => void;
  setTokenInAmount: (amount: BigNumber) => void;
  setTokenInTradeUSDPrice: (price: number) => void;
  setTokenInTradeAllowance: (allowance: BigNumber) => void;
  setTokenInBalance: (balance: string) => void;
  //
  setTokenOut: (tokenIn: any, newToken: any) => void;
  setTokenOutAmount: (amount: BigNumber) => void;
  setTokenOutTradeUSDPrice: (price: number) => void;
  setTokenOutTradeAllowance: (allowance: BigNumber) => void;
  setTokenOutBalance: (balance: string) => void;
  //
  setMinInput: (newMinTick: string) => void;
  setMaxInput: (newMaxTick: string) => void;
  //
  setTradeGasFee: (gasFee: string) => void;
  setTradeGasLimit: (gasLimit: BigNumber) => void;

  //
  switchDirection: () => void;
  setTradePoolFromVolatility: (
    tokenIn: any,
    tokenOut: any,
    volatility: any
  ) => void;

  resetTradeLimitParams: () => void;
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

const initialTradeState: TradeState = {
  poolRouterAddresses: {
    arbitrumGoerli: "0x85856cede494f812742ecbf432832a16ad5033a1",
    arbitrumMainnet: "0x379cbea9234cae9e106bc2a86b39610dc56dbae2",
  },
  //trade pools
  tradePoolAddress: "0x000",
  tradePoolData: {},
  tradePositionData: {},
  feeTierTradeId: 0,
  tradeSlippage: "0.5",
  //
  tradeMintParams: {
    tokenInAmount: BN_ZERO,
    tokenOutAmount: BN_ZERO,
    gasFee: "$0.00",
    gasLimit: BN_ZERO,
    disabled: true,
    buttonMessage: "",
  },
  //
  //this should be false in production, initial value is true because tokenAddresses are hardcoded for testing
  pairSelected: false,
  //
  tokenIn: {
    callId: 0,
    name: "Wrapped Ether",
    symbol: "WETH",
    logoURI: "/static/images/eth_icon.png",
    address: tokenZeroAddress,
    decimals: 18,
    userBalance: 0.0,
    userPoolAllowance: BigNumber.from(0),
    USDPrice: 0.0,
  } as tokenSwap,
  //
  tokenOut: {
    callId: 1,
    name: "DAI",
    symbol: "DAI",
    logoURI: "/static/images/dai_icon.png",
    address: tokenOneAddress,
    decimals: 18,
    userBalance: 0.0,
    userPoolAllowance: BigNumber.from(0),
    USDPrice: 0.0,
  } as tokenSwap,
  //
  minInput: "",
  maxInput: "",
  //
  needsRefetch: false,
  needsPosRefetch: false,
  needsAllowanceIn: true,
  needsAllowanceOut: true,
  needsBalanceIn: true,
  needsBalanceOut: true,
};

export const useTradeStore = create<TradeState & TradeLimitAction>((set) => ({
  poolRouterAddresses: initialTradeState.poolRouterAddresses,
  //trade pool
  tradePoolAddress: initialTradeState.tradePoolAddress,
  tradePoolData: initialTradeState.tradePoolData,
  feeTierTradeId: initialTradeState.feeTierTradeId,
  tradeSlippage: initialTradeState.tradeSlippage,
  //trade position data
  tradePositionData: initialTradeState.tradePositionData,
  //
  tradeMintParams: initialTradeState.tradeMintParams,
  //true if both tokens selected, false if only one token selected
  pairSelected: initialTradeState.pairSelected,
  //tokenIn
  tokenIn: initialTradeState.tokenIn,
  //tokenOut
  tokenOut: initialTradeState.tokenOut,
  //input amounts
  minInput: initialTradeState.minInput,
  maxInput: initialTradeState.maxInput,
  //refresh
  needsRefetch: initialTradeState.needsRefetch,
  needsPosRefetch: initialTradeState.needsPosRefetch,
  needsAllowanceIn: initialTradeState.needsAllowanceIn,
  needsAllowanceOut: initialTradeState.needsAllowanceOut,
  needsBalanceIn: initialTradeState.needsBalanceIn,
  needsBalanceOut: initialTradeState.needsBalanceOut,
  //actions
  setPairSelected: (pairSelected: boolean) => {
    set(() => ({
      pairSelected: pairSelected,
    }));
  },
  setTokenIn: (tokenOut, newToken: tokenSwap) => {
    //if tokenOut is selected
    if (
      tokenOut.address != initialTradeState.tokenOut.address ||
      tokenOut.symbol != "Select Token"
    ) {
      //if the new tokenIn is the same as the selected TokenOut, get TokenOut back to  initialState
      if (newToken.address == tokenOut.address) {
        set(() => ({
          tokenIn: {
            callId: 0,
            ...newToken,
          },
          tokenOut: initialTradeState.tokenOut,
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
      tradeMintParams: {
        ...state.tradeMintParams,
        tokenInAmount: newAmount,
      },
    }));
  },
  setTokenInTradeUSDPrice: (newPrice: number) => {
    set((state) => ({
      tokenIn: { ...state.tokenIn, tradeUSDPrice: newPrice },
    }));
  },
  setTokenInTradeAllowance: (newAllowance: BigNumber) => {
    set((state) => ({
      tokenIn: { ...state.tokenIn, userPoolAllowance: newAllowance },
    }));
  },
  setTokenInBalance: (newBalance: string) => {
    set((state) => ({
      tokenIn: { ...state.tokenIn, userBalance: Number(newBalance) },
    }));
  },
  setTokenOutTradeUSDPrice: (newPrice: number) => {
    set((state) => ({
      tokenOut: { ...state.tokenOut, tradeUSDPrice: newPrice },
    }));
  },
  setTokenOut: (tokenIn, newToken: tokenSwap) => {
    //if tokenIn exists
    if (
      tokenIn.address != initialTradeState.tokenOut.address ||
      tokenIn.symbol != "Select Token"
    ) {
      //if the new selected TokenOut is the same as the current tokenIn, erase the values on TokenIn
      if (newToken.address == tokenIn.address) {
        set(() => ({
          tokenOut: { callId: 0, ...newToken },
          tokenIn: initialTradeState.tokenOut,
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
      tradeMintParams: {
        ...state.tradeMintParams,
        tokenOutAmount: newAmount,
      },
    }));
  },
  setTokenOutBalance: (newBalance: string) => {
    set((state) => ({
      tokenOut: { ...state.tokenOut, userBalance: Number(newBalance) },
    }));
  },
  setTokenOutTradeAllowance: (newAllowance: BigNumber) => {
    set((state) => ({
      tokenOut: { ...state.tokenOut, userPoolAllowance: newAllowance },
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
  setTradePoolAddress: (tradePoolAddress: `0x${string}`) => {
    set(() => ({
      tradePoolAddress: tradePoolAddress,
    }));
  },
  setTradePoolData: (tradePoolData: any) => {
    set(() => ({
      tradePoolData: tradePoolData,
    }));
  },
  setTradeSlippage: (tradeSlippage: string) => {
    set(() => ({
      tradeSlippage: tradeSlippage,
    }));
  },
  setTradePositionData: (tradePositionData: any) => {
    set(() => ({
      tradePositionData: tradePositionData,
    }));
  },
  setTradeGasFee: (gasFee: string) => {
    set((state) => ({
      tradeMintParams: {
        ...state.tradeMintParams,
        gasFee: gasFee,
      },
    }));
  },
  setTradeGasLimit: (gasLimit: BigNumber) => {
    set((state) => ({
      tradeMintParams: {
        ...state.tradeMintParams,
        gasLimit: gasLimit,
      },
    }));
  },

  setMintButtonState: () => {
    set((state) => ({
      tradeMintParams: {
        ...state.tradeMintParams,
        buttonMessage:
          state.tokenIn.userBalance <
          parseFloat(
            ethers.utils.formatUnits(
              String(state.tradeMintParams.tokenInAmount),
              state.tokenIn.decimals
            )
          )
            ? "Insufficient Token Balance"
            : parseFloat(
                ethers.utils.formatUnits(
                  String(state.tradeMintParams.tokenInAmount),
                  18
                )
              ) == 0
            ? "Enter Amount"
            : "Mint Trade Position",
        disabled:
          state.tokenIn.userBalance <
          parseFloat(
            ethers.utils.formatUnits(
              String(state.tradeMintParams.tokenInAmount),
              state.tokenIn.decimals
            )
          )
            ? true
            : parseFloat(
                ethers.utils.formatUnits(
                  String(state.tradeMintParams.tokenInAmount),
                  state.tokenIn.decimals
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
        USDPrice: state.tokenOut.USDPrice,
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
        USDPrice: state.tokenIn.USDPrice,
        userBalance: state.tokenIn.userBalance,
        userPoolAllowance: state.tokenIn.userPoolAllowance,
      },
    }));
  },
  setTradePoolFromVolatility: async (tokenIn, tokenOut, volatility: any) => {
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
            pool["data"]["limitPools"][i]["feeTier"]["feeAmount"] == "500") ||
          (volatilityId == 1 &&
            pool["data"]["limitPools"][i]["feeTier"]["feeAmount"] == "3000") ||
          (volatilityId == 2 &&
            pool["data"]["limitPools"][i]["feeTier"]["feeAmount"] == "10000")
        ) {
          set(() => ({
            tradePoolAddress: pool["data"]["limitPools"][i]["id"],
            tradePoolData: pool["data"]["limitPools"][i],
            feeTierId: volatilityId,
          }));
        }
      }
    } catch (error) {
      console.log(error);
    }
  },

  resetTradeLimitParams: () => {
    set({
      //trade pool & pair
      tradePoolAddress: initialTradeState.tradePoolAddress,
      tradePoolData: initialTradeState.tradePoolData,
      tradeSlippage: initialTradeState.tradeSlippage,
      feeTierTradeId: initialTradeState.feeTierTradeId,
      //trade position data
      tradePositionData: initialTradeState.tradePositionData,
      //trade mint
      tradeMintParams: initialTradeState.tradeMintParams,
      //tokenIn
      tokenIn: initialTradeState.tokenIn,
      //tokenOut
      tokenOut: initialTradeState.tokenOut,
      //selected pair
      pairSelected: initialTradeState.pairSelected,
      //input amounts
      minInput: initialTradeState.minInput,
      maxInput: initialTradeState.maxInput,
      //refresh
      needsAllowanceIn: initialTradeState.needsAllowanceIn,
      needsAllowanceOut: initialTradeState.needsAllowanceOut,
      needsBalanceIn: initialTradeState.needsBalanceIn,
      needsBalanceOut: initialTradeState.needsBalanceOut,
      needsRefetch: initialTradeState.needsRefetch,
      needsPosRefetch: initialTradeState.needsPosRefetch,
    });
  },
}));
