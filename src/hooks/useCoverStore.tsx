import { BigNumber } from "ethers";
import { token } from "../utils/types";
import { BN_ZERO } from "../utils/math/constants";
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
  coverPositionData: any;
  volatilityTierId: number;
  coverSlippage: string;
  //true if both tokens selected, false if only one token selected
  pairSelected: boolean;
  //TokenIn defines the token on the left/up on a swap page
  tokenIn: token;
  tokenInAmount: string;
  tokenInCoverUSDPrice: number;
  tokenInCoverAllowance: string;
  tokenInBalance: string;
  //TokenOut defines the token on the left/up on a swap page
  tokenOut: token;
  tokenOutCoverUSDPrice: number;
  tokenOutBalance: string;
  tokenOutCoverAllowance: string;
  //Claim tick
  claimTick: number;
  //Gas
  gasFee: string;
  gasLimit: BigNumber;
  //refresh
  needsRefetch: boolean;
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
  //tokenOut
  setTokenOut: (tokenOut: token, newToken: token) => void;
  setTokenOutCoverUSDPrice: (price: number) => void;
  setTokenOutBalance: (balance: string) => void;
  setTokenOutCoverAllowance: (allowance: string) => void;
  //Claim tick
  setClaimTick: (tick: number) => void;
  setMinTick: (coverPositionData, tick: BigNumber) => void;
  setMaxTick: (coverPositionData, tick: BigNumber) => void;
  //gas
  setGasFee: (fee: string) => void;
  setGasLimit: (limit: BigNumber) => void;
  //refetch
  setNeedsRefetch: (needsRefetch: boolean) => void;
  //reset
  resetSwapParams: () => void;
  switchDirection: () => void;
  setCoverPoolFromVolatility: (
    tokanIn: token,
    tokenOut: token,
    volatility: any
  ) => void;
};

const initialCoverState: CoverState = {
  //pools
  coverPoolAddress: "0x00",
  coverPoolData: {},
  coverPositionData: {},
  coverSlippage: "0.5",
  volatilityTierId: 0,
  //this should be false in production, initial value is true because tokenAddresses are hardcoded for testing
  pairSelected: true,
  //
  tokenIn: {
    callId: 0,
    name: "Wrapped Ether",
    symbol: "WETH",
    logoURI: "/static/images/eth_icon.png",
    address: tokenOneAddress,
  } as token,
  tokenInAmount: "0.00",
  tokenInCoverUSDPrice: 0,
  tokenInCoverAllowance: "0.00",
  tokenInBalance: "0.00",
  //
  tokenOut: {
    callId: 1,
    name: "Select Token",
    symbol: "Select Token",
    logoURI: "",
    address: tokenZeroAddress,
  } as token,
  tokenOutCoverUSDPrice: 0,
  tokenOutBalance: "0.00",
  tokenOutCoverAllowance: "0.00",
  //
  claimTick: 0,
  //
  gasFee: "$0.00",
  gasLimit: BN_ZERO,
  //
  needsRefetch: false,
};

export const useCoverStore = create<CoverState & CoverAction>((set) => ({
  //pool
  coverPoolAddress: initialCoverState.coverPoolAddress,
  coverPoolData: initialCoverState.coverPoolData,
  coverPositionData: initialCoverState.coverPositionData,
  coverSlippage: initialCoverState.coverSlippage,
  volatilityTierId: initialCoverState.volatilityTierId,
  pairSelected: initialCoverState.pairSelected,
  //tokenIn
  tokenIn: initialCoverState.tokenIn,
  tokenInAmount: initialCoverState.tokenInAmount,
  tokenInCoverUSDPrice: initialCoverState.tokenInCoverUSDPrice,
  tokenInCoverAllowance: initialCoverState.tokenInCoverAllowance,
  tokenInBalance: initialCoverState.tokenInBalance,
  //tokenOut
  tokenOut: initialCoverState.tokenOut,
  tokenOutCoverUSDPrice: initialCoverState.tokenOutCoverUSDPrice,
  tokenOutBalance: initialCoverState.tokenOutBalance,
  tokenOutCoverAllowance: initialCoverState.tokenOutCoverAllowance,
  //tick
  claimTick: initialCoverState.claimTick,
  //gas
  gasFee: initialCoverState.gasFee,
  gasLimit: initialCoverState.gasLimit,
  //refresh
  needsRefetch: initialCoverState.needsRefetch,
  setTokenIn: (tokenOut, newToken: token) => {
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
    set(() => ({
      tokenInAmount: newAmount,
    }));
  },

  setTokenInCoverUSDPrice: (newPrice: number) => {
    set(() => ({
      tokenInCoverUSDPrice: newPrice,
    }));
  },

  setTokenInCoverAllowance: (newAllowance: string) => {
    set(() => ({
      tokenInCoverAllowance: newAllowance,
    }));
  },
  setTokenInBalance: (newBalance: string) => {
    set(() => ({
      tokenInBalance: newBalance,
    }));
  },

  setTokenOutCoverUSDPrice: (newPrice: number) => {
    set(() => ({
      tokenOutCoverUSDPrice: newPrice,
    }));
  },
  setTokenOut: (tokenIn, newToken: token) => {
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
    set(() => ({
      tokenOutBalance: newBalance,
    }));
  },
  setTokenOutCoverAllowance: (newAllowance: string) => {
    set(() => ({
      tokenOutCoverAllowance: newAllowance,
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
      coverSlippage: coverSlippage,
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
    set(() => ({
      gasFee: gasFee,
    }));
  },
  setGasLimit: (gasLimit: BigNumber) => {
    set(() => ({
      gasLimit: gasLimit,
    }));
  },
  setNeedsRefetch: (needsRefetch: boolean) => {
    set(() => ({
      needsRefetch: needsRefetch,
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
          console.log("volatility id", volatilityId);
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
  resetSwapParams: () => {
    set({
      coverPoolAddress: initialCoverState.coverPoolAddress,
      coverPoolData: initialCoverState.coverPoolData,
      coverPositionData: initialCoverState.coverPositionData,
      pairSelected: initialCoverState.pairSelected,
      //tokenIn
      tokenIn: initialCoverState.tokenIn,
      tokenInCoverUSDPrice: initialCoverState.tokenInCoverUSDPrice,
      tokenInCoverAllowance: initialCoverState.tokenInCoverAllowance,
      tokenInBalance: initialCoverState.tokenInBalance,
      //tokenOut
      tokenOut: initialCoverState.tokenOut,
      tokenOutCoverUSDPrice: initialCoverState.tokenOutCoverUSDPrice,
      tokenOutBalance: initialCoverState.tokenOutBalance,
      //tick
      claimTick: initialCoverState.claimTick,
      //gas
      gasFee: initialCoverState.gasFee,
      gasLimit: initialCoverState.gasLimit,
      //refresh
      needsRefetch: initialCoverState.needsRefetch,
    });
  },
}));
