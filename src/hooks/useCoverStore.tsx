import { BigNumber, ethers } from "ethers";
import { CoverSubgraph, LimitSubgraph, tokenCover } from "../utils/types";
import { BN_ZERO, ZERO_ADDRESS } from "../utils/math/constants";
import {
  tokenOneAddress,
  tokenZeroAddress,
} from "../constants/contractAddresses";
import { create } from "zustand";
import { getCoverPoolFromFactory } from "../utils/queries";
import { volatilityTiers } from "../utils/pools";
import { parseUnits } from "../utils/math/valueMath";
import { formatUnits } from "ethers/lib/utils.js";
import {
  getCoverMintButtonDisabled,
  getCoverMintButtonMessage,
} from "../utils/buttons";
import { useConfigStore } from "./useConfigStore";

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
  latestTick: number;
  inputPoolExists: boolean;
  twapReady: boolean;
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
  needsLatestTick: boolean;
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
  setTokenIn: (
    tokenOut: tokenCover,
    newToken: tokenCover,
    amount: string,
    isAmountIn: boolean
  ) => void;
  setTokenInAmount: (amount: BigNumber) => void;
  setTokenInCoverUSDPrice: (price: number) => void;
  setTokenInCoverAllowance: (allowance: string) => void;
  setTokenInBalance: (balance: string) => void;
  //setCoverAmountIn: (amount: BigNumber) => void;
  //tokenOut
  setTokenOut: (
    tokenOut: tokenCover,
    newToken: tokenCover,
    amount: string,
    isAmountIn: boolean
  ) => void;
  setTokenOutAmount: (amount: BigNumber) => void;
  setTokenOutCoverUSDPrice: (price: number) => void;
  setTokenOutBalance: (balance: string) => void;
  setTokenOutCoverAllowance: (allowance: string) => void;
  //setCoverAmountOut: (amount: JSBI) => void;
  //Latest tick
  setLatestTick: (tick: number) => void;
  //Underlying pool exists
  setInputPoolExists: (inputPoolExists: boolean) => void;
  //Twap has enough samples
  setTwapReady: (twapReady: boolean) => void;
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
  setNeedsLatestTick: (needsLatestTick: boolean) => void;
  //allowance
  setNeedsAllowance: (needsAllowance: boolean) => void;
  //balance
  setNeedsBalance: (needsBalance: boolean) => void;
  //reset
  switchDirection: () => void;
  setCoverPoolFromVolatility: (
    tokenIn: tokenCover,
    tokenOut: tokenCover,
    volatility: any,
    client: CoverSubgraph
  ) => void;
  setMintButtonState: () => void;
  setCoverAddLiqDisabled: (coverAddLiqDisabled: boolean) => void;
};

const initialCoverState: CoverState = {
  //pools
  coverPoolAddress: ZERO_ADDRESS as `0x${string}`,
  coverPoolData: {
    volatilityTier: {
      feeAmount: 1000,
      tickSpread: 20,
      twapLength: 12,
      auctionLength: 12,
    },
  },
  coverPositionData: {},
  coverSwapSlippage: "0.5",
  //this should be false in production, initial value is true because tokenAddresses are hardcoded for testing
  pairSelected: true,
  //
  tokenIn: {
    callId: 0,
    name: "Wrapped Ether",
    symbol: "WETH",
    native: false,
    logoURI: "https://raw.githubusercontent.com/poolsharks-protocol/token-metadata/native-eth-support/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
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
    native: false,
    logoURI: "https://raw.githubusercontent.com/poolsharks-protocol/token-metadata/native-eth-support/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
    address: tokenOneAddress,
    decimals: 18,
    userBalance: 0.0,
    userRouterAllowance: 0.0,
    coverUSDPrice: 0.0,
  } as tokenCover,
  latestTick: 0,
  inputPoolExists: false,
  twapReady: false,
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
  needsLatestTick: true,
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
  latestTick: initialCoverState.latestTick,
  inputPoolExists: initialCoverState.inputPoolExists,
  twapReady: initialCoverState.twapReady,
  claimTick: initialCoverState.claimTick,
  coverMintParams: initialCoverState.coverMintParams,
  needsRefetch: initialCoverState.needsRefetch,
  needsPosRefetch: initialCoverState.needsPosRefetch,
  needsLatestTick: initialCoverState.needsLatestTick,
  needsAllowance: initialCoverState.needsAllowance,
  needsBalance: initialCoverState.needsBalance,
  setTokenIn: (
    tokenOut,
    newTokenIn: tokenCover,
    amount: string,
    isAmountIn: boolean
  ) => {
    //if tokenOut is selected
    if (tokenOut.symbol != "Select Token") {
      //if the new tokenIn is the same as the selected TokenOut, get TokenOut back to  initialState
      if (newTokenIn.address.toLowerCase() == tokenOut.address.toLowerCase()) {
        set((state) => ({
          tokenIn: {
            callId: state.tokenOut.callId,
            name: state.tokenOut.name,
            symbol: state.tokenOut.symbol,
            native: state.tokenOut.native,
            logoURI: state.tokenOut.logoURI,
            address: state.tokenOut.address,
            decimals: state.tokenOut.decimals,
            userBalance: state.tokenOut.userBalance,
            userRouterAllowance: state.tokenOut.userRouterAllowance,
            coverUSDPrice: state.tokenOut.coverUSDPrice,
          },
          tokenOut: {
            callId: state.tokenIn.callId,
            name: state.tokenIn.name,
            symbol: state.tokenIn.symbol,
            native: state.tokenIn.native,
            logoURI: state.tokenIn.logoURI,
            address: state.tokenIn.address,
            decimals: state.tokenIn.decimals,
            userBalance: state.tokenIn.userBalance,
            userRouterAllowance: state.tokenIn.userRouterAllowance,
            coverUSDPrice: state.tokenIn.coverUSDPrice,
          },
          needsAllowance: true,
          coverMintParams: {
            ...state.coverMintParams,
            tokenInAmount: parseUnits(amount, state.tokenOut.decimals),
          },
        }));
      } else {
        //if tokens are different
        set((state) => ({
          tokenIn: {
            ...newTokenIn,
            callId:
              newTokenIn.address.localeCompare(tokenOut.address) < 0 ? 0 : 1,
          },
          tokenOut: {
            ...tokenOut,
            callId:
              tokenOut.address.localeCompare(newTokenIn.address) < 0 ? 0 : 1,
          },
          coverMintParams: {
            ...state.coverMintParams,
            tokenInAmount: parseUnits(amount, newTokenIn.decimals),
          },
          pairSelected: true,
        }));
      }
    } else {
      //if tokenOut its not selected
      set((state) => ({
        tokenIn: {
          ...newTokenIn,
          callId: 1,
        },
        tokenOut: {
          ...tokenOut,
          callId: 0,
        },
        coverMintParams: {
          ...state.coverMintParams,
          tokenInAmount: parseUnits(amount, newTokenIn.decimals),
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
  setTokenOut: (
    tokenIn,
    newTokenOut: tokenCover,
    amount: string,
    isAmountIn: boolean
  ) => {
    //if tokenIn exists
    if (tokenIn.symbol != "Select Token") {
      //if the new selected TokenOut is the same as the current tokenIn, erase the values on TokenIn
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
            userBalance: state.tokenOut.userBalance,
            userRouterAllowance: state.tokenOut.userRouterAllowance,
            coverUSDPrice: state.tokenOut.coverUSDPrice,
          },
          tokenOut: {
            callId: state.tokenIn.callId,
            name: state.tokenIn.name,
            symbol: state.tokenIn.symbol,
            native: state.tokenIn.native,
            logoURI: state.tokenIn.logoURI,
            address: state.tokenIn.address,
            decimals: state.tokenIn.decimals,
            userBalance: state.tokenIn.userBalance,
            userRouterAllowance: state.tokenIn.userRouterAllowance,
            coverUSDPrice: state.tokenIn.coverUSDPrice,
          },
          coverMintParams: {
            ...state.coverMintParams,
            tokenInAmount: parseUnits(amount, state.tokenOut.decimals),
          },
          needsAllowance: true,
        }));
      } else {
        //if tokens are different
        set(() => ({
          tokenIn: {
            ...tokenIn,
            callId:
              tokenIn.address.localeCompare(newTokenOut.address) < 0 ? 0 : 1,

          },
          tokenOut: {
            ...newTokenOut,
            callId:
              newTokenOut.address.localeCompare(tokenIn.address) < 0 ? 0 : 1,
          },
          /// @dev - no change on token amounts until exact out is supported
          pairSelected: true,
        }));
      }
    } else {
      //if tokenIn its not selected
      set(() => ({
        tokenIn: { callId: 0, ...tokenIn },
        tokenOut: { callId: 1, ...newTokenOut },
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
  setLatestTick: (latestTick: number) => {
    set(() => ({
      latestTick: latestTick,
    }));
  },
  setInputPoolExists: (inputPoolExists: boolean) => {
    set(() => ({
      inputPoolExists: inputPoolExists,
    }));
  },
  setTwapReady: (twapReady: boolean) => {
    set(() => ({
      twapReady: twapReady,
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
  setNeedsLatestTick: (needsLatestTick: boolean) => {
    set(() => ({
      needsLatestTick: needsLatestTick,
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
        callId: state.tokenOut.callId,
        name: state.tokenOut.name,
        symbol: state.tokenOut.symbol,
        native: state.tokenOut.native,
        logoURI: state.tokenOut.logoURI,
        address: state.tokenOut.address,
        decimals: state.tokenOut.decimals,
        userBalance: state.tokenOut.userBalance,
        userRouterAllowance: state.tokenOut.userRouterAllowance,
        coverUSDPrice: state.tokenOut.coverUSDPrice,
      },
      tokenOut: {
        callId: state.tokenIn.callId,
        name: state.tokenIn.name,
        symbol: state.tokenIn.symbol,
        native: state.tokenIn.native,
        logoURI: state.tokenIn.logoURI,
        address: state.tokenIn.address,
        decimals: state.tokenIn.decimals,
        userBalance: state.tokenIn.userBalance,
        userRouterAllowance: state.tokenIn.userRouterAllowance,
        coverUSDPrice: state.tokenIn.coverUSDPrice,
      },
      needsAllowance: true,
      coverMintParams: {
        ...state.coverMintParams,
        tokenInAmount: parseUnits(
          formatUnits(
            state.coverMintParams.tokenInAmount,
            state.tokenIn.decimals
          ),
          state.tokenOut.decimals
        ),
      },
    }));
  },
  setCoverPoolFromVolatility: async (
    tokenIn,
    tokenOut,
    volatility: any,
    client: CoverSubgraph
  ) => {
    try {
      const pool = await getCoverPoolFromFactory(
        client,
        tokenIn.address,
        tokenOut.address
      );
      let dataLength = pool["data"]["coverPools"].length;
      let matchedVolatility = false;
      for (let i = 0; i < dataLength; i++) {
        if (
          pool["data"]["coverPools"][i]["volatilityTier"]["feeAmount"] ==
          volatility
        ) {
          matchedVolatility = true;
          set(() => ({
            coverPoolAddress: pool["data"]["coverPools"][i]["id"],
            coverPoolData: pool["data"]["coverPools"][i],
          }));
        }
      }
      dataLength = pool["data"]["volatilityTiers"].length;
      if (!matchedVolatility && dataLength != undefined) {
        for (let idx = 0; idx < dataLength; idx++) {
          if (
            pool["data"]["volatilityTiers"][idx]["feeAmount"] ==
            Number(volatility)
          ) {
            set(() => ({
              coverPoolAddress: ZERO_ADDRESS as `0x${string}`,
              coverPoolData: {
                volatilityTier: pool["data"]["volatilityTiers"][idx],
              },
            }));
          }
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
        buttonMessage: getCoverMintButtonMessage(
          state.coverMintParams.tokenInAmount,
          state.tokenIn,
          state.coverPoolAddress,
          state.inputPoolExists,
          state.twapReady
        ),
        disabled: getCoverMintButtonDisabled(
          state.coverMintParams.tokenInAmount,
          state.tokenIn,
          state.coverPoolAddress,
          state.inputPoolExists,
          state.twapReady
        ),
      },
    }));
  },
  setCoverAddLiqDisabled: (coverAddLiqDisabled: boolean) => {
    set((state) => ({
      coverPositionData: {
        ...state.coverPositionData,
        addLiqDisabled: coverAddLiqDisabled,
      },
    }));
  },
}));
