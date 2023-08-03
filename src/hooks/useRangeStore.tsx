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
  //rangePoolData contains all the info about the pool
  rangePoolData: any;
  rangeSlippage: string;
  //Range position data containing all the info about the position
  rangePositionData: any;
  //true if both tokens selected, false if only one token selected
  pairSelected: Boolean;
  //TokenIn defines the token on the left/up on a swap page
  tokenIn: token;
  tokenInAmount: BigNumber;
  tokenInRangeUSDPrice: number;
  tokenInRangeAllowance: BigNumber;
  tokenInBalance: string;
  //TokenOut defines the token on the left/up on a swap page
  tokenOut: token;
  tokenOutAmount: BigNumber;
  tokenOutRangeUSDPrice: number;
  tokenOutBalance: string;
  tokenOutRangeAllowance: BigNumber;
  //min and max price input
  minInput: string;
  maxInput: string;
  //Gas
  gasFee: BigNumber;
  gasLimit: BigNumber;
  //Disabled
  disabled: boolean;
  buttonMessage: string;
};

type RangeAction = {
  //
  setRangePoolAddress: (address: String) => void;
  setRangePoolData: (data: any) => void;
  setRangeSlippage: (rangeSlippage: string) => void;
  setRangePositionData: (rangePosition: any) => void;
  //
  setPairSelected: (pairSelected: Boolean) => void;
  //
  setTokenIn: (tokenOut: any, newToken: any) => void;
  setTokenInAmount: (amount: BigNumber) => void;
  setTokenInRangeUSDPrice: (price: number) => void;
  setTokenInRangeAllowance: (allowance: BigNumber) => void;
  setTokenInBalance: (balance: string) => void;
  //
  setTokenOut: (tokenIn: any, newToken: any) => void;
  setTokenOutAmount: (amount: BigNumber) => void;
  setTokenOutRangeUSDPrice: (price: number) => void;
  setTokenOutRangeAllowance: (allowance: BigNumber) => void;
  setTokenOutBalance: (balance: string) => void;
  //
  setMinInput: (newMinTick: string) => void;
  setMaxInput: (newMaxTick: string) => void;
  //
  setGasFee: (gasFee: BigNumber) => void;
  setGasLimit: (gasLimit: BigNumber) => void;
  //
  switchDirection: () => void;
  resetRangeParams: () => void;
  //
  setDisabled: (disabled: boolean) => void;
  setButtonMessage: (balance: string) => void;
};

const initialRangeState: RangeState = {
  //pools
  rangePoolAddress: "0x000",
  rangePoolData: {},
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
  tokenInRangeAllowance: BN_ZERO,
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
  tokenOutRangeAllowance: BN_ZERO,
  tokenOutBalance: "0.00",
  //
  minInput: "",
  maxInput: "",
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
  tokenInRangeUSDPrice: initialRangeState.tokenInRangeUSDPrice,
  tokenInRangeAllowance: initialRangeState.tokenInRangeAllowance,
  tokenInBalance: initialRangeState.tokenInBalance,
  //tokenOut
  tokenOut: initialRangeState.tokenOut,
  tokenOutAmount: initialRangeState.tokenOutAmount,
  tokenOutRangeUSDPrice: initialRangeState.tokenOutRangeUSDPrice,
  tokenOutBalance: initialRangeState.tokenOutBalance,
  tokenOutRangeAllowance: initialRangeState.tokenOutRangeAllowance,
  //input amounts
  minInput: initialRangeState.minInput,
  maxInput: initialRangeState.maxInput,
  //gas
  gasFee: initialRangeState.gasFee,
  gasLimit: initialRangeState.gasLimit,
  //range position data
  rangePositionData: initialRangeState.rangePositionData,
  //contract calls
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
  setTokenInRangeUSDPrice: (newPrice: number) => {
    set(() => ({
      tokenInRangeUSDPrice: newPrice,
    }));
  },
  setTokenInRangeAllowance: (newAllowance: BigNumber) => {
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
  setTokenOutBalance: (newBalance: string) => {
    set(() => ({
      tokenOutBalance: newBalance,
    }));
  },
  setTokenOutRangeAllowance: (newAllowance: BigNumber) => {
    set(() => ({
      tokenOutRangeAllowance: newAllowance,
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
  setDisabled: (disabled: boolean) => {
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
  resetRangeParams: () => {
    set({
      //pool & pair
      rangePoolAddress: initialRangeState.rangePoolAddress,
      rangePoolData: initialRangeState.rangePoolData,
      rangeSlippage: initialRangeState.rangeSlippage,
      pairSelected: initialRangeState.pairSelected,
      //tokenIn
      tokenIn: initialRangeState.tokenIn,
      tokenInAmount: initialRangeState.tokenInAmount,
      tokenInRangeUSDPrice: initialRangeState.tokenInRangeUSDPrice,
      tokenInRangeAllowance: initialRangeState.tokenInRangeAllowance,
      tokenInBalance: initialRangeState.tokenInBalance,
      //tokenOut
      tokenOut: initialRangeState.tokenOut,
      tokenOutAmount: initialRangeState.tokenOutAmount,
      tokenOutRangeUSDPrice: initialRangeState.tokenOutRangeUSDPrice,
      tokenOutBalance: initialRangeState.tokenOutBalance,
      tokenOutRangeAllowance: initialRangeState.tokenOutRangeAllowance,
      //input amounts
      minInput: initialRangeState.minInput,
      maxInput: initialRangeState.maxInput,
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
