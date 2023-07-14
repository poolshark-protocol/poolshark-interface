import { BigNumber } from "ethers";
import { token } from "../utils/types";
import { BN_ZERO } from "../utils/math/constants";
import {
  tokenOneAddress,
  tokenZeroAddress,
} from "../constants/contractAddresses";
import { create } from "zustand";

type RangeState = {
  //poolAddress for current token pairs
  ////range
  rangePoolAddress: `0x${string}`;
  rangePoolData: any;
  rangePoolPositionData: any;
  rangeSlippage: string;
  //true if both tokens selected, false if only one token selected
  pairSelected: Boolean;
  //TokenIn defines the token on the left/up on a swap page
  tokenIn: token;
  tokenInAmount: BigNumber;
  tokenInRangeUSDPrice: number;
  tokenInRangeAllowance: string;
  tokenInBalance: string;
  //TokenOut defines the token on the left/up on a swap page
  tokenOut: token;
  tokenOutAmount: BigNumber;
  tokenOutRangeUSDPrice: Number;
  tokenOutBalance: string;
  tokenOutRangeAllowance: string;
  //Pool price
  price: number;
  //Liquidity
  userLiquidity: string;
  //Token amount
  userTokenAmount: string;
  //min and max ticks for selected price range
  minTick: BigNumber;
  maxTick: BigNumber;
  //min and max price input
  minInput: string;
  maxInput: string;
  //fee tier & tick spacing
  feeTier: string;
  tickSpacing: string;
  //TVL
  tvlUsd: string;
  //Volume
  volumeUsd: string;
  volumeEth: string;
  //Gas
  gasFee: BigNumber;
  gasLimit: BigNumber;
  //Range position data
  rangePositionData: any;
  //Disabled
  disabled: Boolean;
  buttonMessage: string;
};

type RangeAction = {
  //
  setRangePoolAddress: (address: String) => void;
  setRangePoolData: (data: any) => void;
  setRangeSlippage: (rangeSlippage: string) => void;
  //
  setPairSelected: (pairSelected: Boolean) => void;
  //
  setTokenIn: (tokenOut: any, newToken: any) => void;
  setTokenInAmount: (amount: BigNumber) => void;
  //setValueTokenIn: (value: string) => void;
  setTokenInRangeUSDPrice: (price: number) => void;
  setTokenInRangeAllowance: (allowance: string) => void;
  setTokenInBalance: (balance: string) => void;
  //
  setTokenOut: (tokenOut: any, newToken: any) => void;
  setTokenOutAmount: (amount: BigNumber) => void;
  //setValueTokenOut: (value: string) => void;
  setTokenOutRangeUSDPrice: (price: number) => void;
  setTokenOutRangeAllowance: (allowance: string) => void;
  setTokenOutBalance: (balance: string) => void;
  //
  setPrice: (price: number) => void;
  //
  setUserLiquidity: (liquidity: string) => void;
  //
  setUserTokenAmount: (amount: string) => void;
  //
  setMinTick: (newMinTick: BigNumber) => void;
  setMaxTick: (newMaxTick: BigNumber) => void;
  //
  setMinInput: (newMinTick: string) => void;
  setMaxInput: (newMaxTick: string) => void;
  //
  setFeeTier: (newFeeTier: string) => void;
  setTickSpacing: (newTickSpacing: string) => void;
  //
  setTvlUsd: (newTvlUsd: string) => void;
  //
  setVolumeUsd: (newVolumeUsd: string) => void;
  setVolumeEth: (newVolumeEth: string) => void;
  //
  setGasFee: (gasFee: BigNumber) => void;
  setGasLimit: (gasLimit: BigNumber) => void;
  //
  setRangePositionData: (rangePosition: any) => void;
  //
  resetRangeParams: () => void;
  //
  setDisabled: (disabled: Boolean) => void;
  setButtonMessage: (balance: string) => void;
};

const initialRangeState: RangeState = {
  //pools
  rangePoolAddress: "0x000",
  rangePoolData: {},
  //rangePositionData: {},
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
  } as token,
  tokenInAmount: BN_ZERO,
  tokenInRangeUSDPrice: 0,
  tokenInRangeAllowance: "0",
  tokenInBalance: "0.00",
  //
  tokenOut: {
    callId: 1,
    name: "Select Token",
    symbol: "Select Token",
    logoURI: "",
    address: tokenZeroAddress,
  } as token,
  tokenOutAmount: BN_ZERO,
  tokenOutRangeUSDPrice: 0,
  tokenOutRangeAllowance: "0",
  tokenOutBalance: "0.00",
  //
  price: 0,
  //
  userLiquidity: "0.00",
  //
  userTokenAmount: "0.00",
  //
  minTick: BN_ZERO,
  maxTick: BN_ZERO,
  //
  minInput: "",
  maxInput: "",
  //
  feeTier: "0",
  tickSpacing: "0",
  //
  tvlUsd: "0.00",
  //
  volumeUsd: "0.00",
  volumeEth: "0.00",
  //
  gasFee: BN_ZERO,
  gasLimit: BN_ZERO,
  //
  rangePositionData: {},
  //
  disabled: false,
  buttonMessage: "",
};

export const useRangeStore = create<RangeState & RangeAction>((set) => ({
  //pool
  rangePoolAddress: initialRangeState.rangePoolAddress,
  rangePoolData: initialRangeState.rangePoolData,
  rangeSlippage: initialRangeState.rangeSlippage,
  //true if both tokens selected, false if only one token selected
  pairSelected: initialRangeState.pairSelected,
  //tokenIn
  tokenIn: initialRangeState.tokenIn,
  tokenInAmount: initialRangeState.tokenInAmount,
  //valueTokenIn: initialRangeState.valueTokenIn,
  tokenInRangeUSDPrice: initialRangeState.tokenInRangeUSDPrice,
  tokenInRangeAllowance: initialRangeState.tokenInRangeAllowance,
  tokenInBalance: initialRangeState.tokenInBalance,
  //tokenOut
  tokenOut: initialRangeState.tokenOut,
  tokenOutAmount: initialRangeState.tokenOutAmount,
  //valueTokenOut: initialRangeState.valueTokenOut,
  tokenOutRangeUSDPrice: initialRangeState.tokenOutRangeUSDPrice,
  tokenOutBalance: initialRangeState.tokenOutBalance,
  tokenOutRangeAllowance: initialRangeState.tokenOutRangeAllowance,
  //price
  price: initialRangeState.price,
  //liquidity
  userLiquidity: initialRangeState.userLiquidity,
  //token amount
  userTokenAmount: initialRangeState.userTokenAmount,
  //ticks
  minTick: initialRangeState.minTick,
  maxTick: initialRangeState.maxTick,
  //ticks
  minInput: initialRangeState.minInput,
  maxInput: initialRangeState.maxInput,
  //fee tier
  feeTier: initialRangeState.feeTier,
  tickSpacing: initialRangeState.tickSpacing,
  //TVL
  tvlUsd: initialRangeState.tvlUsd,
  //Volume
  volumeUsd: initialRangeState.volumeUsd,
  volumeEth: initialRangeState.volumeEth,
  //gas
  gasFee: initialRangeState.gasFee,
  gasLimit: initialRangeState.gasLimit,
  //range position data
  rangePositionData: initialRangeState.rangePositionData,
  //disable
  disabled: initialRangeState.disabled,
  buttonMessage: initialRangeState.buttonMessage,
  //actions
  setPairSelected: (pairSelected: Boolean) => {
    set(() => ({
      pairSelected: pairSelected,
    }));
  },

  setTokenIn: (tokenOut, newToken: token) => {
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
    set(() => ({
      tokenInAmount: newAmount,
    }));
  },
  /* setValueTokenIn: (newValue: string) => {
    set(() => ({
      valueTokenIn: newValue,
    }));
  }, */
  setTokenInRangeUSDPrice: (newPrice: number) => {
    set(() => ({
      tokenInRangeUSDPrice: newPrice,
    }));
  },
  setTokenInRangeAllowance: (newAllowance: string) => {
    set(() => ({
      tokenInRangeAllowance: newAllowance,
    }));
  },
  setTokenInBalance: (newBalance: string) => {
    set(() => ({
      tokenInBalance: newBalance,
    }));
  },
  setTokenOutRangeUSDPrice: (newPrice: number) => {
    set(() => ({
      tokenOutRangeUSDPrice: newPrice,
    }));
  },
  setTokenOut: (tokenIn, newToken: token) => {
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
    set(() => ({
      tokenOutAmount: newAmount,
    }));
  },
  /* setValueTokenOut: (newValue: string) => {
    set(() => ({
      valueTokenOut: newValue,
    }));
  }, */
  setTokenOutBalance: (newBalance: string) => {
    set(() => ({
      tokenOutBalance: newBalance,
    }));
  },
  setTokenOutRangeAllowance: (newAllowance: string) => {
    set(() => ({
      tokenOutRangeAllowance: newAllowance,
    }));
  },
  setPrice: (newPrice: number) => {
    set(() => ({
      price: newPrice,
    }));
  },
  setUserLiquidity: (newLiquidity: string) => {
    set(() => ({
      userLiquidity: newLiquidity,
    }));
  },
  setUserTokenAmount: (newAmount: string) => {
    set(() => ({
      userTokenAmount: newAmount,
    }));
  },
  setMinTick: (newMinTick: BigNumber) => {
    set(() => ({
      minTick: newMinTick,
    }));
  },
  setMaxTick: (newMaxTick: BigNumber) => {
    set(() => ({
      maxTick: newMaxTick,
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
  setFeeTier: (newFeeTier: string) => {
    set(() => ({
      feeTier: newFeeTier,
    }));
  },
  setTickSpacing: (newTickSpacing: string) => {
    set(() => ({
      tickSpacing: newTickSpacing,
    }));
  },
  setTvlUsd: (newTvlUsd: string) => {
    set(() => ({
      tvlUsd: newTvlUsd,
    }));
  },
  setVolumeUsd: (newVolumeUsd: string) => {
    set(() => ({
      volumeUsd: newVolumeUsd,
    }));
  },
  setVolumeEth: (newVolumeEth: string) => {
    set(() => ({
      volumeEth: newVolumeEth,
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
  setGasFee: (gasFee: BigNumber) => {
    set(() => ({
      gasFee: gasFee,
    }));
  },
  setGasLimit: (gasLimit: BigNumber) => {
    set(() => ({
      gasLimit: gasLimit,
    }));
  },
  setRangePositionData: (rangePositionData: any) => {
    set(() => ({
      rangePositionData: rangePositionData,
    }));
  },
  setDisabled: (disabled: Boolean) => {
    set(() => ({
      disabled: disabled,
    }));
  },
  setButtonMessage: (buttonMessage: string) => {
    set(() => ({
      buttonMessage: buttonMessage,
    }));
  },
  switchDirection: () => {
    set((state) => ({
      tokenIn: state.tokenOut,
      tokenOut: state.tokenIn,
    }));
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
      //valueTokenIn: initialRangeState.valueTokenIn,
      tokenInRangeUSDPrice: initialRangeState.tokenInRangeUSDPrice,
      tokenInRangeAllowance: initialRangeState.tokenInRangeAllowance,
      tokenInBalance: initialRangeState.tokenInBalance,
      //tokenOut
      tokenOut: initialRangeState.tokenOut,
      //valueTokenOut: initialRangeState.valueTokenOut,
      tokenOutRangeUSDPrice: initialRangeState.tokenOutRangeUSDPrice,
      tokenOutBalance: initialRangeState.tokenOutBalance,
      tokenOutRangeAllowance: initialRangeState.tokenOutRangeAllowance,
      //price
      price: initialRangeState.price,
      //liquidity
      userLiquidity: initialRangeState.userLiquidity,
      //token amount
      userTokenAmount: initialRangeState.userTokenAmount,
      //ticks
      minTick: initialRangeState.minTick,
      maxTick: initialRangeState.maxTick,
      //ticks
      minInput: initialRangeState.minInput,
      maxInput: initialRangeState.maxInput,
      //fee tier
      feeTier: initialRangeState.feeTier,
      tickSpacing: initialRangeState.tickSpacing,
      //TVL
      tvlUsd: initialRangeState.tvlUsd,
      //Volume
      volumeUsd: initialRangeState.volumeUsd,
      volumeEth: initialRangeState.volumeEth,
      //gas
      gasFee: initialRangeState.gasFee,
      gasLimit: initialRangeState.gasLimit,
      //position data
      rangePositionData: initialRangeState.rangePositionData,
      //disable
      disabled: initialRangeState.disabled,
      buttonMessage: initialRangeState.buttonMessage,
    });
  },
}));
