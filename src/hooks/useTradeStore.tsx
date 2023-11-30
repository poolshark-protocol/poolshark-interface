import { BigNumber, ethers } from "ethers";
import { LimitSubgraph, tokenSwap } from "../utils/types";
import { BN_ZERO, ZERO_ADDRESS } from "../utils/math/constants";
import {
  wethAddress,
} from "../constants/contractAddresses";
import { create } from "zustand";
import {
  getLimitPoolFromFactory,
} from "../utils/queries";
import { parseUnits } from "../utils/math/valueMath";
import { getTradeButtonDisabled, getTradeButtonMessage } from "../utils/buttons";

type TradeState = {
  //tradePoolData contains all the info about the pool
  tradePoolData: any;
  feeTierTradeId: number;
  tradeSlippage: string;
  //Trade position data containing all the info about the position
  tradePositionData: any;
  // swap button state
  tradeButton: {
    disabled: boolean;
    buttonMessage: string;
  }
  limitPriceString: string;
  //true if both tokens selected, false if only one token selected
  pairSelected: boolean;
  //true if wrapping ETH or unwrapping WETH
  wethCall: boolean;
  //TokenIn defines the token on the left/up on a swap page
  tokenIn: tokenSwap;
  //TokenOut defines the token on the left/up on a swap page
  tokenOut: tokenSwap;
  //Token BigNumber amounts
  amountIn: BigNumber;
  amountOut: BigNumber;
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
  needsSnapshot: boolean;
  needsPairUpdate: boolean;
  needsSetAmounts: boolean;
  //Start price for pool creation
  startPrice: string;
  limitPriceOrder: boolean;
};

type TradeLimitAction = {
  //
  setTradePoolData: (data: any) => void;
  setTradeSlippage: (tradeSlippage: string) => void;
  setTradePositionData: (tradePosition: any) => void;
  //
  setPairSelected: (pairSelected: boolean) => void;
  //
  setTokenIn: (tokenOut: any, newToken: any, amount: string, isAmountIn: boolean) => void;
  setTokenInTradeUSDPrice: (price: number) => void;
  setTokenInTradeAllowance: (allowance: BigNumber) => void;
  setTokenInBalance: (balance: string) => void;
  //
  setTokenOut: (tokenIn: any, newToken: any, amount: string, isAmountIn: boolean) => void;
  setTokenOutTradeUSDPrice: (price: number) => void;
  setTokenOutTradeAllowance: (allowance: BigNumber) => void;
  setTokenOutBalance: (balance: string) => void;
  //
  setAmountIn: (amountIn: BigNumber) => void;
  setAmountOut: (amountOut: BigNumber) => void;
  //
  setMinInput: (newMinTick: string) => void;
  setMaxInput: (newMaxTick: string) => void;
  //
  switchDirection: (isAmountIn: boolean, amount: string, amountSetter: any) => void;
  setTradePoolFromVolatility: (
    tokenIn: any,
    tokenOut: any,
    volatility: any,
    client: LimitSubgraph
  ) => void;
  resetTradeLimitParams: () => void;
  //
  setLimitPriceString: (limitPrice: string) => void;
  //
  setTradeButtonState: () => void;
  //
  setNeedsRefetch: (needsRefetch: boolean) => void;
  setNeedsPosRefetch: (needsPosRefetch: boolean) => void;
  setNeedsAllowanceIn: (needsAllowance: boolean) => void;
  setNeedsAllowanceOut: (needsAllowance: boolean) => void;
  setNeedsBalanceIn: (needsBalance: boolean) => void;
  setNeedsBalanceOut: (needsBalance: boolean) => void;
  setNeedsSnapshot: (needsSnapshot: boolean) => void;
  setNeedsPairUpdate: (needsPairUpdate: boolean) => void;
  setNeedsSetAmounts: (needsSetAmounts: boolean) => void;
  setStartPrice: (startPrice: string) => void;
  setLimitPriceOrder: (limitPriceOrder: boolean) => void;
};

const initialTradeState: TradeState = {
  //trade pools
  tradePoolData: {},
  tradePositionData: {},
  feeTierTradeId: 0,
  tradeSlippage: "0.1",
  //
  tradeButton: {
    disabled: true,
    buttonMessage: "Select Token",
  },
  //
  //this should be false in production, initial value is true because tokenAddresses are hardcoded for testing
  pairSelected: false,
  wethCall: false,
  //
  tokenIn: {
    callId: 0,
    name: "Wrapped Ether",
    symbol: "WETH",
    native: false,
    logoURI:
      "https://raw.githubusercontent.com/poolsharks-protocol/token-metadata/stake-range/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
    address: wethAddress,
    decimals: 18,
    userBalance: 0.0,
    userRouterAllowance: BigNumber.from(0),
    USDPrice: 0.0,
  } as tokenSwap,
  //
  tokenOut: {
    callId: 1,
    name: "Select Token",
    symbol: "Select Token",
    native: false,
    logoURI: "",
    address: ZERO_ADDRESS as `0x${string}`,
    decimals: 18,
    userBalance: 0.0,
    userRouterAllowance: BigNumber.from(0),
    USDPrice: 0.0,
  } as tokenSwap,
  limitPriceString: '0.00',
  amountIn: BN_ZERO,
  amountOut: BN_ZERO,
  //
  minInput: "",
  maxInput: "",
  //
  needsRefetch: true,
  needsPosRefetch: false,
  needsAllowanceIn: true,
  needsAllowanceOut: true,
  needsBalanceIn: true,
  needsBalanceOut: false,
  needsSnapshot: true,
  needsPairUpdate: false,
  needsSetAmounts: false,
  startPrice: "",
  limitPriceOrder: true,
};

export const useTradeStore = create<TradeState & TradeLimitAction>((set) => ({
  //trade pool
  tradePoolData: initialTradeState.tradePoolData,
  feeTierTradeId: initialTradeState.feeTierTradeId,
  tradeSlippage: initialTradeState.tradeSlippage,
  //trade position data
  tradePositionData: initialTradeState.tradePositionData,
  // market swap button
  tradeButton: initialTradeState.tradeButton,
  //true if both tokens selected, false if only one token selected
  pairSelected: initialTradeState.pairSelected,
  wethCall: initialTradeState.wethCall,
  //tokenIn
  tokenIn: initialTradeState.tokenIn,
  //tokenOut
  tokenOut: initialTradeState.tokenOut,
  //token amounts
  amountIn: initialTradeState.amountIn,
  amountOut: initialTradeState.amountOut,
  //input amounts
  minInput: initialTradeState.minInput,
  maxInput: initialTradeState.maxInput,
  // limit swap
  limitPriceString: initialTradeState.limitPriceString,
  //refresh
  needsRefetch: initialTradeState.needsRefetch,
  needsPosRefetch: initialTradeState.needsPosRefetch,
  needsAllowanceIn: initialTradeState.needsAllowanceIn,
  needsAllowanceOut: initialTradeState.needsAllowanceOut,
  needsBalanceIn: initialTradeState.needsBalanceIn,
  needsBalanceOut: initialTradeState.needsBalanceOut,
  needsSnapshot: initialTradeState.needsSnapshot,
  needsPairUpdate: initialTradeState.needsPairUpdate,
  needsSetAmounts: initialTradeState.needsSetAmounts,
  startPrice: initialTradeState.startPrice,
  limitPriceOrder: initialTradeState.limitPriceOrder,
  //actions
  setPairSelected: (pairSelected: boolean) => {
    set(() => ({
      pairSelected: pairSelected,
    }));
  },
  setTokenIn: (tokenOut, newTokenIn: tokenSwap, amount: string, isAmountIn: boolean) => {
    //if tokenOut is selected
    if (tokenOut.address != initialTradeState.tokenOut.address) {
      //if the new tokenIn is the same as the selected TokenOut, get TokenOut back to initialState
      if (newTokenIn.address?.toLowerCase() == tokenOut.address?.toLowerCase() &&
          newTokenIn.native == tokenOut.native) {
        set((state) => ({
          tokenIn: {
            callId: state.tokenOut.callId,
            name: state.tokenOut.name,
            symbol: state.tokenOut.symbol,
            native: state.tokenOut.native,
            logoURI: state.tokenOut.logoURI,
            address: state.tokenOut.address,
            decimals: state.tokenOut.decimals,
            USDPrice: state.tokenOut.USDPrice,
            userBalance: state.tokenOut.userBalance,
            userRouterAllowance: state.tokenOut.userRouterAllowance,
          },
          tokenOut: {
            callId: state.tokenIn.callId,
            name: state.tokenIn.name,
            symbol: state.tokenIn.symbol,
            native: state.tokenIn.native,
            logoURI: state.tokenIn.logoURI,
            address: state.tokenIn.address,
            decimals: state.tokenIn.decimals,
            USDPrice: state.tokenIn.USDPrice,
            userBalance: state.tokenIn.userBalance,
            userRouterAllowance: state.tokenIn.userRouterAllowance,
          },
          amountIn: isAmountIn ? parseUnits(amount, state.tokenOut.decimals) : state.amountIn,
          amountOut: isAmountIn ? state.amountOut : parseUnits(amount, state.tokenIn.decimals),
          needsAllowanceIn: !state.tokenOut.native ?? true,
          needsSetAmounts: true,
          wethCall: state.tokenOut.address.toLowerCase() == state.tokenIn.address.toLowerCase(),
        }));
      } else {
        //if tokens are different
        set((state) => ({
          tokenIn: {
            ...newTokenIn,
            callId:
              newTokenIn.address.localeCompare(tokenOut.address) < 0 ? 0 : 1,
            native: newTokenIn.native ?? false,
          },
          tokenOut: {
            ...tokenOut,
            callId:
              tokenOut.address.localeCompare(newTokenIn.address) < 0 ? 0 : 1,
          },
          amountIn: isAmountIn ? parseUnits(amount, newTokenIn.decimals) : state.amountIn,
          // if wethCall
          pairSelected: true,
          needsBalanceIn: true,
          needsAllowanceIn: true,
          needsPairUpdate: true,
          needsSetAmounts: true,
          wethCall: newTokenIn.address.toLowerCase() == tokenOut.address.toLowerCase(),
          limitPriceOrder: state.limitPriceOrder == (newTokenIn.address.localeCompare(tokenOut.address) < 0),
        }));
      }
    } else {
      //if tokenOut is not selected
      set((state) => ({
        tokenIn: {
          ...newTokenIn,
          callId: 1,
          native: newTokenIn.native ?? false,
        },
        tokenOut: {
          ...tokenOut,
          callId: 0,
        },
        amountIn: isAmountIn ? parseUnits(amount, newTokenIn.decimals) : state.amountIn,
        pairSelected: false,
        wethCall: false,
        needsAllowanceIn: !newTokenIn.native,
      }));
    }
  },
  setTokenInTradeUSDPrice: (newPrice: number) => {
    set((state) => ({
      tokenIn: { ...state.tokenIn, USDPrice: newPrice },
    }));
  },
  setTokenInTradeAllowance: (newAllowance: BigNumber) => {
    set((state) => ({
      tokenIn: { ...state.tokenIn, userRouterAllowance: newAllowance },
    }));
  },
  setTokenInBalance: (newBalance: string) => {
    set((state) => ({
      tokenIn: { ...state.tokenIn, userBalance: Number(newBalance) },
    }));
  },
  setTokenOutTradeUSDPrice: (newPrice: number) => {
    set((state) => ({
      tokenOut: { ...state.tokenOut, USDPrice: newPrice },
    }));
  },
  setTokenOut: (tokenIn, newTokenOut: tokenSwap, amount: string, isAmountIn: boolean) => {
    //if tokenIn exists
    if (tokenIn.address != initialTradeState.tokenOut.address) {
      //if the new selected TokenOut is the same as the current tokenIn, erase the values on TokenIn
      // NATIVE: only flip tokens if 'isNative' also matches
      if (newTokenOut.address.toLowerCase() == tokenIn.address.toLowerCase() &&
          newTokenOut.native == tokenIn.native) {
        set((state) => ({
          tokenIn: {
            callId: state.tokenOut.callId,
            name: state.tokenOut.name,
            symbol: state.tokenOut.symbol,
            native: state.tokenOut.native,
            logoURI: state.tokenOut.logoURI,
            address: state.tokenOut.address,
            decimals: state.tokenOut.decimals,
            USDPrice: state.tokenOut.USDPrice,
            userBalance: state.tokenOut.userBalance,
            userRouterAllowance: state.tokenOut.userRouterAllowance,
          },
          tokenOut: {
            callId: state.tokenIn.callId,
            name: state.tokenIn.name,
            symbol: state.tokenIn.symbol,
            native: state.tokenIn.native,
            logoURI: state.tokenIn.logoURI,
            address: state.tokenIn.address,
            decimals: state.tokenIn.decimals,
            USDPrice: state.tokenIn.USDPrice,
            userBalance: state.tokenIn.userBalance,
            userRouterAllowance: state.tokenIn.userRouterAllowance,
          },
          amountIn: isAmountIn ? parseUnits(amount, state.tokenOut.decimals) : state.amountIn,
          amountOut: isAmountIn ? state.amountOut : parseUnits(amount, state.tokenIn.decimals),
          needsAllowanceIn: !state.tokenOut.native ?? true,
          needsSetAmounts: true,
          wethCall: state.tokenIn.address.toLowerCase() == state.tokenOut.address.toLowerCase(),
        }));
      } else {
        //if tokens are different
        set((state) => ({
          tokenIn: {
            ...tokenIn,
            callId: tokenIn.address.localeCompare(newTokenOut.address) < 0 ? 0 : 1,
          },
          tokenOut: {
            ...newTokenOut,
            callId: newTokenOut.address.localeCompare(tokenIn.address) < 0 ? 0 : 1,
            native: newTokenOut.native ?? false,
          },
          amountOut: isAmountIn ? state.amountOut : parseUnits(amount, newTokenOut.decimals),
          pairSelected: true,
          wethCall: newTokenOut.address.toLowerCase() == tokenIn.address.toLowerCase(),
          needsBalanceOut: true,
          needsAllowanceIn: true,
          needsPairUpdate: true,
        }));
      }
    } else {
      //if tokenIn is not selected
      set((state) => ({
        tokenIn: {
          ...tokenIn,
          callId: 0,
        },
        tokenOut: {
          ...newTokenOut,
          callId: 1,
          native: newTokenOut.native ?? false,
        },
        amountOut: isAmountIn ? state.amountOut : parseUnits(amount, newTokenOut.decimals),
        pairSelected: false,
        wethCall: false,
        needsBalanceOut: true,
      }));
    }
  },
  setTokenOutBalance: (newBalance: string) => {
    set((state) => ({
      tokenOut: { ...state.tokenOut, userBalance: Number(newBalance) },
    }));
  },
  setTokenOutTradeAllowance: (newAllowance: BigNumber) => {
    set((state) => ({
      tokenOut: { ...state.tokenOut, userRouterAllowance: newAllowance },
    }));
  },
  setAmountIn: (amountIn: BigNumber) => {
    set((state) => ({
      amountIn: amountIn
    }));
  },
  setAmountOut: (amountOut: BigNumber) => {
    set((state) => ({
      amountOut: amountOut
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
  setLimitPriceString: (limitPrice: string) => {
    set(() => ({
      limitPriceString: !isNaN(parseFloat(limitPrice)) ? limitPrice : '0.00',
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
  setTradeButtonState: () => {
    set((state) => ({
      tradeButton: {
        buttonMessage: getTradeButtonMessage(
          state.tokenIn,
          state.tokenOut,
          state.amountIn
        ),
        disabled: getTradeButtonDisabled(
          state.tokenIn,
          state.tokenOut,
          state.amountIn,
        ),
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
  setNeedsSnapshot: (needsSnapshot: boolean) => {
    set(() => ({
      needsSnapshot: needsSnapshot,
    }));
  },
  setNeedsPairUpdate: (needsPairUpdate: boolean) => {
    set(() => ({
      needsPairUpdate: needsPairUpdate,
    }));
  },
  setNeedsSetAmounts: (needsSetAmounts: boolean) => {
    set(() => ({
      needsSetAmounts: needsSetAmounts,
    }));
  },
  setStartPrice: (startPrice: string) => {
    set({
      startPrice: startPrice
    })
  },
  setLimitPriceOrder: (limitPriceOrder: boolean) =>  {
    set({
      limitPriceOrder: limitPriceOrder
    })
  },
  switchDirection: (isAmountIn: boolean, amount: string) => {
    set((state) => ({
      tokenIn: {
        callId: state.tokenOut.callId,
        name: state.tokenOut.name,
        symbol: state.tokenOut.symbol,
        native: state.tokenOut.native,
        logoURI: state.tokenOut.logoURI,
        address: state.tokenOut.address,
        decimals: state.tokenOut.decimals,
        USDPrice: state.tokenOut.USDPrice,
        userBalance: state.tokenOut.userBalance,
        userRouterAllowance: state.tokenOut.userRouterAllowance,
      },
      tokenOut: {
        callId: state.tokenIn.callId,
        name: state.tokenIn.name,
        symbol: state.tokenIn.symbol,
        native: state.tokenIn.native,
        logoURI: state.tokenIn.logoURI,
        address: state.tokenIn.address,
        decimals: state.tokenIn.decimals,
        USDPrice: state.tokenIn.USDPrice,
        userBalance: state.tokenIn.userBalance,
        userRouterAllowance: state.tokenIn.userRouterAllowance,
      },
      amountIn: isAmountIn ? parseUnits(amount, state.tokenOut.decimals) : state.amountIn,
      amountOut: isAmountIn ? state.amountOut : parseUnits(amount, state.tokenIn.decimals),
      needsAllowanceIn: true,
      needsSetAmounts: true,
    }));
  },
  setTradePoolFromVolatility: async (tokenIn, tokenOut, volatility: any, client: LimitSubgraph) => {
    try {
      const pool = await getLimitPoolFromFactory(
        client,
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
      tradePoolData: initialTradeState.tradePoolData,
      tradeSlippage: initialTradeState.tradeSlippage,
      feeTierTradeId: initialTradeState.feeTierTradeId,
      //trade position data
      tradePositionData: initialTradeState.tradePositionData,
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
      needsSnapshot: initialTradeState.needsSnapshot,
    });
  },
}));
