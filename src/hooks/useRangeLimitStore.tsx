import { BigNumber, ethers } from "ethers";
import { LimitSubgraph, token, tokenRangeLimit } from "../utils/types";
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
import { parseUnits } from "../utils/math/valueMath";
import { getRangeMintButtonDisabled, getRangeMintButtonMessage } from "../utils/buttons";

type RangeLimitState = {
  //rangePoolAddress for current token pairs
  rangePoolAddress: `0x${string}`;
  //rangePoolData contains all the info about the pool
  rangePoolData: any;
  rangeSlippage: string;
  //Range position data containing all the info about the position
  rangePositionData: any;
  //range params for minting position
  rangeMintParams: {
    tokenInAmount: BigNumber;
    tokenOutAmount: BigNumber;
    gasFee: string;
    gasLimit: BigNumber;
    disabled: boolean;
    buttonMessage: string;
  };
  //limitPoolAddress for current token pairs
  limitPoolAddress: `0x${string}`;
  //limitPositionData contains all the info about the position
  limitPoolData: any;
  feeTierLimitId: number;
  //Limit position data containing all the info about the position
  limitPositionData: any;
  //limit params for minting position
  limitMintParams: {
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
  tokenIn: tokenRangeLimit;
  //TokenOut defines the token on the left/up on a swap page
  tokenOut: tokenRangeLimit;
  //min and max price input
  minInput: string;
  maxInput: string;
  //price order
  priceOrder: boolean;
  //refresh
  needsRefetch: boolean;
  needsPosRefetch: boolean;
  needsAllowanceIn: boolean;
  needsAllowanceOut: boolean;
  needsBalanceIn: boolean;
  needsBalanceOut: boolean;
  needsSnapshot: boolean;
  //Claim tick
  claimTick: number;
  //Expected output
  currentAmountOut: string;
  //Start price for pool creation
  startPrice: string;
};

type RangeLimitAction = {
  //
  setRangePoolAddress: (address: String) => void;
  setRangePoolData: (data: any) => void;
  setRangeSlippage: (rangeSlippage: string) => void;
  setRangePositionData: (rangePosition: any) => void;
  //
  setLimitPoolAddress: (address: String) => void;
  setLimitPoolData: (data: any) => void;
  setLimitPositionData: (limitPosition: any) => void;
  //
  setPairSelected: (pairSelected: boolean) => void;
  //
  setTokenIn: (tokenOut: any, newToken: any, amount: string, isAmountIn: boolean) => void;
  setTokenInAmount: (amount: BigNumber) => void;
  setTokenInRangeUSDPrice: (price: number) => void;
  setTokenInRangeAllowance: (allowance: BigNumber) => void;
  setTokenInBalance: (balance: string) => void;
  //
  setTokenOut: (tokenIn: any, newToken: any, amount: string, isAmountIn: boolean) => void;
  setTokenOutAmount: (amount: BigNumber) => void;
  setTokenOutRangeUSDPrice: (price: number) => void;
  setTokenOutRangeAllowance: (allowance: BigNumber) => void;
  setTokenOutBalance: (balance: string) => void;
  //
  setMinInput: (newMinTick: string) => void;
  setMaxInput: (newMaxTick: string) => void;
  //
  setRangeGasFee: (gasFee: string) => void;
  setRangeGasLimit: (gasLimit: BigNumber) => void;
  //
  setLimitGasFee: (gasFee: string) => void;
  setLimitGasLimit: (gasLimit: BigNumber) => void;
  //
  switchDirection: () => void;
  setRangePoolFromFeeTier: (
    tokenIn: token,
    tokenOut: token,
    volatility: any,
    client: LimitSubgraph,
    poolPrice?: any,
    tickAtPrice?: any
  ) => void;
  setLimitPoolFromVolatility: (
    tokenIn: any,
    tokenOut: any,
    volatility: any,
    client: LimitSubgraph
  ) => void;
  resetRangeLimitParams: () => void;
  resetMintParams: () => void;
  resetPoolData: () => void;
  //
  setMintButtonState: () => void;
  //
  setPriceOrder: (priceOrder: boolean) => void;
  setNeedsRefetch: (needsRefetch: boolean) => void;
  setNeedsPosRefetch: (needsPosRefetch: boolean) => void;
  setNeedsAllowanceIn: (needsAllowance: boolean) => void;
  setNeedsAllowanceOut: (needsAllowance: boolean) => void;
  setNeedsBalanceIn: (needsBalance: boolean) => void;
  setNeedsBalanceOut: (needsBalance: boolean) => void;
  setNeedsSnapshot: (needsSnapshot: boolean) => void;
  //
  setClaimTick: (claimTick: number) => void;
  //
  setCurrentAmountOut: (currentAmountOut: string) => void;
  setStartPrice: (startPrice: string) => void;
};

const initialRangeLimitState: RangeLimitState = {
  //range pools
  rangePoolAddress: ZERO_ADDRESS as `0x${string}`,
  rangePoolData: {},
  rangePositionData: {},
  rangeSlippage: "0.5",
  //
  rangeMintParams: {
    tokenInAmount: BN_ZERO,
    tokenOutAmount: BN_ZERO,
    gasFee: "$0.00",
    gasLimit: BN_ZERO,
    disabled: true,
    buttonMessage: "",
  },
  //limit pools
  limitPoolAddress: ZERO_ADDRESS as `0x${string}`,
  limitPoolData: {},
  limitPositionData: {},
  feeTierLimitId: 0,
  //
  limitMintParams: {
    tokenInAmount: BN_ZERO,
    tokenOutAmount: BN_ZERO,
    gasFee: "$0.00",
    gasLimit: BN_ZERO,
    disabled: true,
    buttonMessage: "",
  },
  pairSelected: false,
  //
  tokenIn: {
    callId: 0,
    name: "Wrapped Ether",
    symbol: "WETH",
    logoURI: "/static/images/eth_icon.svg",
    address: tokenZeroAddress,
    decimals: 18,
    userBalance: 0.0,
    userRouterAllowance: BigNumber.from(0),
    USDPrice: 0.0,
  } as tokenRangeLimit,
  //
  tokenOut: {
    callId: 1,
    name: "DAI",
    symbol: "DAI",
    logoURI: "/static/images/dai_icon.png",
    address: tokenOneAddress,
    decimals: 18,
    userBalance: 0.0,
    userRouterAllowance: BigNumber.from(0),
    USDPrice: 0.0,
  } as tokenRangeLimit,
  //
  minInput: "",
  maxInput: "",
  priceOrder: true,
  //
  needsRefetch: false,
  needsPosRefetch: false,
  needsAllowanceIn: true,
  needsAllowanceOut: true,
  needsBalanceIn: true,
  needsBalanceOut: true,
  needsSnapshot: true,
  //
  claimTick: 0,
  //
  currentAmountOut: "0",
  startPrice: "",
};

export const useRangeLimitStore = create<RangeLimitState & RangeLimitAction>(
  (set) => ({
    //range pool
    rangePoolAddress: initialRangeLimitState.rangePoolAddress,
    rangePoolData: initialRangeLimitState.rangePoolData,
    rangeSlippage: initialRangeLimitState.rangeSlippage,
    //range position data
    rangePositionData: initialRangeLimitState.rangePositionData,
    //
    rangeMintParams: initialRangeLimitState.rangeMintParams,
    //limit pool
    limitPoolAddress: initialRangeLimitState.limitPoolAddress,
    limitPoolData: initialRangeLimitState.limitPoolData,
    feeTierLimitId: initialRangeLimitState.feeTierLimitId,
    //limit position data
    limitPositionData: initialRangeLimitState.limitPositionData,
    //
    limitMintParams: initialRangeLimitState.limitMintParams,
    //true if both tokens selected, false if only one token selected
    pairSelected: initialRangeLimitState.pairSelected,
    //tokenIn
    tokenIn: initialRangeLimitState.tokenIn,
    //tokenOut
    tokenOut: initialRangeLimitState.tokenOut,
    //input amounts
    minInput: initialRangeLimitState.minInput,
    maxInput: initialRangeLimitState.maxInput,
    //price order
    priceOrder: initialRangeLimitState.priceOrder,
    //refresh
    needsRefetch: initialRangeLimitState.needsRefetch,
    needsPosRefetch: initialRangeLimitState.needsPosRefetch,
    needsAllowanceIn: initialRangeLimitState.needsAllowanceIn,
    needsAllowanceOut: initialRangeLimitState.needsAllowanceOut,
    needsBalanceIn: initialRangeLimitState.needsBalanceIn,
    needsBalanceOut: initialRangeLimitState.needsBalanceOut,
    needsSnapshot: initialRangeLimitState.needsSnapshot,
    //claim tick
    claimTick: initialRangeLimitState.claimTick,
    //expected output
    currentAmountOut: initialRangeLimitState.currentAmountOut,
    //start price for pool creation
    startPrice: initialRangeLimitState.startPrice,
    //actions
    setPairSelected: (pairSelected: boolean) => {
      set(() => ({
        pairSelected: pairSelected,
      }));
    },
    setTokenIn: (tokenOut, newTokenIn: tokenRangeLimit, amount: string, isAmountIn: boolean) => {
      //if tokenOut is selected
      if (tokenOut.symbol != "Select Token") {
        //if the new tokenIn is the same as the selected TokenOut, get TokenOut back to  initialState
        if (newTokenIn.address.toLowerCase() == tokenOut.address.toLowerCase()) {
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
            rangeMintParams: {
              ...state.rangeMintParams,
              tokenInAmount: isAmountIn ? parseUnits(amount, state.tokenOut.decimals) : state.rangeMintParams.tokenInAmount,
              tokenOutAmount: isAmountIn ? state.rangeMintParams.tokenOutAmount : parseUnits(amount, state.tokenIn.decimals),
            },
            limitMintParams: {
              ...state.limitMintParams,
              tokenInAmount: isAmountIn ? parseUnits(amount, state.tokenOut.decimals) : state.limitMintParams.tokenInAmount,
              tokenOutAmount: isAmountIn ? state.limitMintParams.tokenOutAmount : parseUnits(amount, state.tokenIn.decimals),
            },
            needsAllowanceIn: true,
            needsAllowanceOut: true,
          }));
        } else {
          //if tokens are different
          set((state) => ({
            tokenIn: {
              callId:
                newTokenIn.address.localeCompare(tokenOut.address) < 0 ? 0 : 1,
              ...newTokenIn,
            },
            tokenOut: {
              callId:
                tokenOut.address.localeCompare(newTokenIn.address) < 0 ? 0 : 1,
              ...tokenOut,
            },
            pairSelected: true,
            rangeMintParams: {
              ...state.rangeMintParams,
              tokenInAmount: isAmountIn ? parseUnits(amount, newTokenIn.decimals) : state.rangeMintParams.tokenInAmount,
            },
            limitMintParams: {
              ...state.limitMintParams,
              tokenInAmount: isAmountIn ? parseUnits(amount, newTokenIn.decimals) : state.limitMintParams.tokenInAmount,
            },
            needsAllowanceIn: true,
          }));
        }
      } else {
        //if tokenOut its not selected
        set(() => ({
          tokenIn: {
            callId: 1,
            ...newTokenIn,
          },
          tokenOut: {
            callId: 0,
            ...tokenOut,
          },
          pairSelected: false,
        }));
      }
    },
    setTokenInAmount: (newAmount: BigNumber) => {
      set((state) => ({
        rangeMintParams: {
          ...state.rangeMintParams,
          tokenInAmount: newAmount,
        },
      }));
    },
    setTokenInRangeUSDPrice: (newPrice: number) => {
      set((state) => ({
        tokenIn: { ...state.tokenIn, USDPrice: newPrice },
      }));
    },
    setTokenInRangeAllowance: (newAllowance: BigNumber) => {
      set((state) => ({
        tokenIn: { ...state.tokenIn, userRouterAllowance: newAllowance },
      }));
    },
    setTokenInBalance: (newBalance: string) => {
      set((state) => ({
        tokenIn: { ...state.tokenIn, userBalance: Number(newBalance) },
      }));
    },
    setTokenOutRangeUSDPrice: (newPrice: number) => {
      set((state) => ({
        tokenOut: { ...state.tokenOut, USDPrice: newPrice },
      }));
    },
    setTokenOut: (tokenIn, newTokenOut: tokenRangeLimit, amount: string, isAmountIn: boolean) => {
      //if tokenIn exists
      if (
        tokenIn.address != initialRangeLimitState.tokenOut.address ||
        tokenIn.symbol != "Select Token"
      ) {
        //if the new selected TokenOut is the same as the current tokenIn, erase the values on TokenIn
        if (newTokenOut.address.toLowerCase() == tokenIn.address.toLowerCase()) {
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
            rangeMintParams: {
              ...state.rangeMintParams,
              tokenInAmount: isAmountIn ? parseUnits(amount, state.tokenOut.decimals) : state.rangeMintParams.tokenInAmount,
              tokenOutAmount: isAmountIn ? state.rangeMintParams.tokenOutAmount : parseUnits(amount, state.tokenIn.decimals),
            },
            limitMintParams: {
              ...state.limitMintParams,
              tokenInAmount: isAmountIn ? parseUnits(amount, state.tokenOut.decimals) : state.limitMintParams.tokenInAmount,
              tokenOutAmount: isAmountIn ? state.limitMintParams.tokenOutAmount : parseUnits(amount, state.tokenIn.decimals),
            },
            needsAllowanceIn: true,
            needsAllowanceOut: true
          }));
        } else {
          //if tokens are different
          set((state) => ({
            tokenIn: {
              callId:
                tokenIn.address.localeCompare(newTokenOut.address) < 0 ? 0 : 1,
              ...tokenIn,
            },
            tokenOut: {
              callId:
                newTokenOut.address.localeCompare(tokenIn.address) < 0 ? 0 : 1,
              ...newTokenOut,
            },
            rangeMintParams: {
              ...state.rangeMintParams,
              tokenOutAmount: isAmountIn ? state.rangeMintParams.tokenOutAmount : parseUnits(amount, newTokenOut.decimals),
            },
            limitMintParams: {
              ...state.limitMintParams,
              tokenOutAmount: isAmountIn ? state.limitMintParams.tokenOutAmount : parseUnits(amount, newTokenOut.decimals),
            },
            pairSelected: true,
            needsAllowanceOut: true
          }));
        }
      } else {
        //if tokenIn its not selected
        set(() => ({
          tokenIn: { callId: 0, ...tokenIn},
          tokenOut: { callId: 1, ...newTokenOut},
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
    setTokenOutRangeAllowance: (newAllowance: BigNumber) => {
      set((state) => ({
        tokenOut: { ...state.tokenOut, userRouterAllowance: newAllowance },
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
    setPriceOrder: (priceOrder: boolean) => {
      set(() => ({
        priceOrder: priceOrder,
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
    setRangePositionData: (rangePositionData: any) => {
      set(() => ({
        rangePositionData: rangePositionData,
      }));
    },
    setRangeGasFee: (gasFee: string) => {
      set((state) => ({
        rangeMintParams: {
          ...state.rangeMintParams,
          gasFee: gasFee,
        },
      }));
    },
    setRangeGasLimit: (gasLimit: BigNumber) => {
      set((state) => ({
        rangeMintParams: {
          ...state.rangeMintParams,
          gasLimit: gasLimit,
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
    setLimitGasFee: (gasFee: string) => {
      set((state) => ({
        limitMintParams: {
          ...state.limitMintParams,
          gasFee: gasFee,
        },
      }));
    },
    setLimitGasLimit: (gasLimit: BigNumber) => {
      set((state) => ({
        limitMintParams: {
          ...state.limitMintParams,
          gasLimit: gasLimit,
        },
      }));
    },
    setMintButtonState: () => {
      // pass to a utils function to set buttonMessage and disabled
      set((state) => ({
        rangeMintParams: {
          ...state.rangeMintParams,
          buttonMessage: getRangeMintButtonMessage(
            state.rangeMintParams.tokenInAmount,
            state.rangeMintParams.tokenOutAmount,
            state.tokenIn,
            state.tokenOut,
            state.rangePoolAddress,
            state.startPrice,
          ),
          disabled: getRangeMintButtonDisabled(
            state.rangeMintParams.tokenInAmount,
            state.rangeMintParams.tokenOutAmount,
            state.tokenIn,
            state.tokenOut,
            state.rangePoolAddress,
            state.startPrice
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
          userRouterAllowance: state.tokenOut.userRouterAllowance,
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
          userRouterAllowance: state.tokenIn.userRouterAllowance,
        },
      }));
    },
    setRangePoolFromFeeTier: async (
      tokenIn: token,
      tokenOut: token,
      volatility: any,
      client: LimitSubgraph,
      poolPrice?: any,
      tickAtPrice?: any
    ) => {
      try {
        const pool = await getRangePoolFromFactory(
          client,
          tokenIn.address,
          tokenOut.address
        );
        const dataLength = pool["data"]["limitPools"].length;
        let poolFound = false;
        for (let i = 0; i < dataLength; i++) {
          if (
            pool["data"]["limitPools"][i]["feeTier"]["feeAmount"] == volatility
          ) {
            poolFound = true;
            set(() => ({
              rangePoolAddress: pool["data"]["limitPools"][i]["id"],
              rangePoolData: pool["data"]["limitPools"][i],
            }));
          }
        }
        if (!poolFound) {
          set((state) => ({
            rangePoolAddress: ZERO_ADDRESS as `0x${string}`,
            rangePoolData: {
              feeTier: state.rangePoolData.feeTier,
            },
          }));
        }
      } catch (error) {
        console.log(error);
      }
    },
    setLimitPoolFromVolatility: async (tokenIn, tokenOut, volatility: any, client: LimitSubgraph) => {
      try {
        const pool = await getLimitPoolFromFactory(
          client,
          tokenIn.address,
          tokenOut.address
        );
        const dataLength = pool["data"]["limitPools"].length;
        for (let i = 0; i < dataLength; i++) {
          if (
            pool["data"]["limitPools"][i]["feeTier"]["feeAmount"] == volatility
          ) {
            set(() => ({
              limitPoolAddress: pool["data"]["limitPools"][i]["id"],
              limitPoolData: pool["data"]["limitPools"][i],
            }));
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    setClaimTick: (claimTick: number) => {
      set(() => ({
        claimTick: claimTick,
      }));
    },
    setCurrentAmountOut: (currentAmountOut: string) => {
      set(() => ({
        currentAmountOut: currentAmountOut,
      }));
    },
    setNeedsSnapshot: (needsSnapshot: boolean) => {
      set(() => ({
        needsSnapshot: needsSnapshot,
      }));
    },
    setStartPrice: (startPrice: string) =>  {
      set(() => ({
        startPrice: startPrice
      }))
    },
    resetRangeLimitParams: () => {
      set({
        //range pool & pair
        rangePoolAddress: initialRangeLimitState.rangePoolAddress,
        rangePoolData: initialRangeLimitState.rangePoolData,
        rangeSlippage: initialRangeLimitState.rangeSlippage,
        //range position data
        rangePositionData: initialRangeLimitState.rangePositionData,
        //range mint
        rangeMintParams: initialRangeLimitState.rangeMintParams,
        //limit pool
        limitPoolAddress: initialRangeLimitState.limitPoolAddress,
        limitPoolData: initialRangeLimitState.limitPoolData,
        feeTierLimitId: initialRangeLimitState.feeTierLimitId,
        //limit position data
        limitPositionData: initialRangeLimitState.limitPositionData,
        //limit mint
        limitMintParams: initialRangeLimitState.limitMintParams,
        //tokenIn
        tokenIn: initialRangeLimitState.tokenIn,
        //tokenOut
        tokenOut: initialRangeLimitState.tokenOut,
        //selected pair
        pairSelected: initialRangeLimitState.pairSelected,
        //input amounts
        minInput: initialRangeLimitState.minInput,
        maxInput: initialRangeLimitState.maxInput,
        //refresh
        needsAllowanceIn: initialRangeLimitState.needsAllowanceIn,
        needsAllowanceOut: initialRangeLimitState.needsAllowanceOut,
        needsBalanceIn: initialRangeLimitState.needsBalanceIn,
        needsBalanceOut: initialRangeLimitState.needsBalanceOut,
        needsRefetch: initialRangeLimitState.needsRefetch,
        needsPosRefetch: initialRangeLimitState.needsPosRefetch,
        needsSnapshot: initialRangeLimitState.needsSnapshot,
        //claim tick
        claimTick: initialRangeLimitState.claimTick,
        //expected output
        currentAmountOut: initialRangeLimitState.currentAmountOut,
      });
    },
    resetMintParams: () => {
      set((state) => ({
        rangeMintParams: initialRangeLimitState.rangeMintParams,
        limitMintParams: initialRangeLimitState.limitMintParams,
      }));
    },
    resetPoolData: () =>  {
      set((state) => ({
        rangePoolData: initialRangeLimitState.rangePoolData,
      }));
    }
  })
);
