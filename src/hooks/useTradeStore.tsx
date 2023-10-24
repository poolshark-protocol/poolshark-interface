import { BigNumber, ethers } from "ethers";
import { LimitSubgraph, tokenRangeLimit, tokenSwap } from "../utils/types";
import { BN_ZERO, ZERO_ADDRESS } from "../utils/math/constants";
import {
  tokenOneAddress,
  tokenZeroAddress,
} from "../constants/contractAddresses";
import { create } from "zustand";
import {
  getLimitPoolFromFactory,
  getRangePoolFromFactory,
} from "../utils/queries";
import inputFilter from "../utils/inputFilter";
import { parseUnits } from "../utils/math/valueMath";

type TradeState = {
  //tradePoolAddress for current token pairs
  tradePoolAddress: `0x${string}`;
  //tradePoolData contains all the info about the pool
  tradePoolData: any;
  feeTierTradeId: number;
  tradeSlippage: string;
  //Trade position data containing all the info about the position
  tradePositionData: any;
  //trade params for minting position
  tradeParams: {
    tokenInAmount: BigNumber;
    tokenOutAmount: BigNumber;
    gasFee: string;
    gasLimit: BigNumber;
    disabled: boolean;
    buttonMessage: string;
  };
  limitPriceString: string;
  //true if both tokens selected, false if only one token selected
  pairSelected: boolean;
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
  setAmountIn: (amountIn: BigNumber) => void;
  setAmountOut: (amountOut: BigNumber) => void;
  //
  setMinInput: (newMinTick: string) => void;
  setMaxInput: (newMaxTick: string) => void;
  //
  setTradeGasFee: (gasFee: string) => void;
  setTradeGasLimit: (gasLimit: BigNumber) => void;

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
  setMintButtonState: () => void;
  //
  setNeedsRefetch: (needsRefetch: boolean) => void;
  setNeedsPosRefetch: (needsPosRefetch: boolean) => void;
  setNeedsAllowanceIn: (needsAllowance: boolean) => void;
  setNeedsAllowanceOut: (needsAllowance: boolean) => void;
  setNeedsBalanceIn: (needsBalance: boolean) => void;
  setNeedsBalanceOut: (needsBalance: boolean) => void;
  setNeedsSnapshot: (needsSnapshot: boolean) => void;
};

const initialTradeState: TradeState = {
  //trade pools
  tradePoolAddress: ZERO_ADDRESS as `0x${string}`,
  tradePoolData: {},
  tradePositionData: {},
  feeTierTradeId: 0,
  tradeSlippage: "0.1",
  //
  tradeParams: {
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
    logoURI:
      "https://raw.githubusercontent.com/poolsharks-protocol/token-metadata/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
    address: tokenZeroAddress,
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
};

export const useTradeStore = create<TradeState & TradeLimitAction>((set) => ({
  //trade pool
  tradePoolAddress: initialTradeState.tradePoolAddress,
  tradePoolData: initialTradeState.tradePoolData,
  feeTierTradeId: initialTradeState.feeTierTradeId,
  tradeSlippage: initialTradeState.tradeSlippage,
  //trade position data
  tradePositionData: initialTradeState.tradePositionData,
  //
  tradeParams: initialTradeState.tradeParams,
  //true if both tokens selected, false if only one token selected
  pairSelected: initialTradeState.pairSelected,
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
  //actions
  setPairSelected: (pairSelected: boolean) => {
    set(() => ({
      pairSelected: pairSelected,
    }));
  },
  setTokenIn: (tokenOut, newToken: tokenSwap) => {
    //if tokenOut is selected
    if (tokenOut.address != initialTradeState.tokenOut.address) {
      //if the new tokenIn is the same as the selected TokenOut, get TokenOut back to initialState
      if (newToken.address.toLowerCase() == tokenOut.address.toLowerCase()) {
        set((state) => ({
          tokenIn: {
            callId: state.tokenOut.callId,
            name: state.tokenOut.name,
            symbol: state.tokenOut.symbol,
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
            logoURI: state.tokenIn.logoURI,
            address: state.tokenIn.address,
            decimals: state.tokenIn.decimals,
            USDPrice: state.tokenIn.USDPrice,
            userBalance: state.tokenIn.userBalance,
            userRouterAllowance: state.tokenIn.userRouterAllowance,
          },
        }));
      } else {
        //if tokens are different
        set(() => ({
          tokenIn: {
            callId:
              newToken.address.localeCompare(tokenOut.address) < 0 ? 0 : 1,
            ...newToken,
          },
          tokenOut: {
            callId:
              newToken.address.localeCompare(tokenOut.address) < 0 ? 1 : 0,
            name: tokenOut.name,
            symbol: tokenOut.symbol,
            logoURI: tokenOut.logoURI,
            address: tokenOut.address,
            decimals: tokenOut.decimals,
            USDPrice: tokenOut.USDPrice,
            userBalance: tokenOut.userBalance,
            userRouterAllowance: tokenOut.userRouterAllowance,
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
      tradeParams: {
        ...state.tradeParams,
        tokenInAmount: newAmount,
      },
    }));
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
  setTokenOut: (tokenIn, newToken: tokenSwap) => {
    //if tokenIn exists
    if (tokenIn.address != initialTradeState.tokenOut.address) {
      //if the new selected TokenOut is the same as the current tokenIn, erase the values on TokenIn
      if (newToken.address.toLowerCase() == tokenIn.address.toLowerCase()) {
        set((state) => ({
          tokenIn: {
            callId: state.tokenOut.callId,
            name: state.tokenOut.name,
            symbol: state.tokenOut.symbol,
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
            logoURI: state.tokenIn.logoURI,
            address: state.tokenIn.address,
            decimals: state.tokenIn.decimals,
            USDPrice: state.tokenIn.USDPrice,
            userBalance: state.tokenIn.userBalance,
            userRouterAllowance: state.tokenIn.userRouterAllowance,
          },
        }));
      } else {
        //if tokens are different
        set(() => ({
          tokenIn: {
            callId: tokenIn.address.localeCompare(newToken.address) < 0 ? 0 : 1,
            symbol: tokenIn.symbol,
            name: tokenIn.name,
            logoURI: tokenIn.logoURI,
            address: tokenIn.address,
            decimals: tokenIn.decimals,
            USDPrice: tokenIn.USDPrice,
            userBalance: tokenIn.userBalance,
            userRouterAllowance: tokenIn.userRouterAllowance,
          },
          tokenOut: {
            callId: tokenIn.address.localeCompare(newToken.address) < 0 ? 1 : 0,
            ...newToken,
          },
          pairSelected: true,
        }));
      }
    } else {
      //if tokenIn its not selected
      set(() => ({
        tokenOut: {
          callId: 0,
          ...newToken,
        },
        tokenIn: initialTradeState.tokenOut,
        pairSelected: false,
      }));
    }
  },
  setTokenOutAmount: (newAmount: BigNumber) => {
    set((state) => ({
      tradeParams: {
        ...state.tradeParams,
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
      tradeParams: {
        ...state.tradeParams,
        gasFee: gasFee,
      },
    }));
  },
  setTradeGasLimit: (gasLimit: BigNumber) => {
    set((state) => ({
      tradeParams: {
        ...state.tradeParams,
        gasLimit: gasLimit,
      },
    }));
  },

  setMintButtonState: () => {
    set((state) => ({
      tradeParams: {
        ...state.tradeParams,
        buttonMessage:
          state.tokenIn.userBalance <
          parseFloat(
            ethers.utils.formatUnits(
              String(state.tradeParams.tokenInAmount),
              state.tokenIn.decimals
            )
          )
            ? "Insufficient Token Balance"
            : parseFloat(
                ethers.utils.formatUnits(
                  String(state.tradeParams.tokenInAmount),
                  state.tokenIn.decimals
                )
              ) == 0
            ? "Enter Amount"
            : "Mint Trade Position",
        disabled:
          state.tokenIn.userBalance <
          parseFloat(
            ethers.utils.formatUnits(
              String(state.tradeParams.tokenInAmount),
              state.tokenIn.decimals
            )
          )
            ? true
            : parseFloat(
                ethers.utils.formatUnits(
                  String(state.tradeParams.tokenInAmount),
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
  setNeedsSnapshot: (needsSnapshot: boolean) => {
    set(() => ({
      needsSnapshot: needsSnapshot,
    }));
  },
  switchDirection: (isAmountIn: boolean, amount: string) => {
    set((state) => ({
      tokenIn: {
        callId: state.tokenOut.callId,
        name: state.tokenOut.name,
        symbol: state.tokenOut.symbol,
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
        logoURI: state.tokenIn.logoURI,
        address: state.tokenIn.address,
        decimals: state.tokenIn.decimals,
        USDPrice: state.tokenIn.USDPrice,
        userBalance: state.tokenIn.userBalance,
        userRouterAllowance: state.tokenIn.userRouterAllowance,
      },
      amountIn: isAmountIn ? parseUnits(amount, state.tokenOut.decimals) : state.amountIn,
      amountOut: isAmountIn ? state.amountOut : parseUnits(amount, state.tokenIn.decimals)
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
      tradeParams: initialTradeState.tradeParams,
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
