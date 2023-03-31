import { create } from "zustand";
import { BigNumber, ethers } from "ethers";

type Pool = {
  tokenOneName: string;
  tokenZeroName: string;
  tokenOneAddress: string;
  tokenZeroAddress: string;
  poolAddress: string;
};

type ContractParams = {
  prevLower: BigNumber;
  min: BigNumber;
  prevUpper: BigNumber;
  max: BigNumber;
  claim: BigNumber;
  amount: BigNumber;
  inverse: boolean;
};

type SwapParams = {
  tokenOneName: string;
  tokenZeroName: string;
  tokenOneAddress: string;
  tokenZeroAddress: string;
};

type SwapState = {
  SwapParams: SwapParams;
  Allowance: BigNumber;
  Amount: BigNumber;
  Limit: BigNumber;
};

type SwapAction = {
  updateSwapParams: (SwapParams: SwapParams) => void;
  updateSwapAmount: (amount: BigNumber) => void;
  updateSwapAllowance: (allowance: BigNumber) => void;
  updateLimitAmount:  (limit: BigNumber) => void;
  resetSwapParams: () => void;
};

const initialSwapState: SwapState = {
  SwapParams: {
    tokenOneName: "",
    tokenZeroName: "",
    tokenOneAddress: "",
    tokenZeroAddress: "",
  },
  Allowance: BigNumber.from(0),
  Amount: BigNumber.from(0),
  Limit: BigNumber.from(0)
};

type State = {
  pool: Pool;
  contractParams: ContractParams;
  CoverAllowance: BigNumber;
};

type Action = {
  updatePool: (pool: Pool) => void;
  resetPool: () => void;
  resetContractParams: () => void;
  updateContractParams: (contractParams: ContractParams) => void;
  updateCoverAllowance: (allowance: BigNumber) => void;
};

const initialCoverState: State = {
  pool: {
    tokenOneName: "",
    tokenZeroName: "",
    tokenOneAddress: "",
    tokenZeroAddress: "",
    poolAddress: "",
  },
  contractParams: {
    prevLower: ethers.utils.parseUnits("0"),
    min: ethers.utils.parseUnits("20", 0),
    prevUpper: ethers.utils.parseUnits("887272", 0),
    max: ethers.utils.parseUnits("30", 0),
    claim: ethers.utils.parseUnits("20", 0),
    amount: ethers.utils.parseUnits("0", 0),
    inverse: false,
  },
  CoverAllowance: BigNumber.from(0),
};

export const useStore = create<State & Action>((set) => ({
  pool: initialCoverState.pool,
  CoverAllowance: initialCoverState.CoverAllowance,
  contractParams: initialCoverState.contractParams,
  resetPool: () => {
    set({ pool: initialCoverState.pool });
  },
  resetContractParams: () => {
    set({ contractParams: initialCoverState.contractParams });
  },
  updatePool: (pool: Pool) =>
    set(() => ({
      pool: pool,
    })),
  updateContractParams: (contractParams: ContractParams) =>
    set(() => ({
      contractParams: contractParams,
    })),
  updateCoverAllowance: (allowance: BigNumber) =>
    set(() => ({
      CoverAllowance: allowance,
    })),
}));

export const useSwapStore = create<SwapState & SwapAction>((set) => ({
  SwapParams: initialSwapState.SwapParams,
  Allowance: initialSwapState.Allowance,
  Amount: initialSwapState.Amount,
  Limit: initialSwapState.Limit,
  resetSwapParams: () => {
    set({ SwapParams: initialSwapState.SwapParams });
  },
  updateSwapParams: (SwapParams: SwapParams) =>
  set(() => ({
   SwapParams: SwapParams,
  })),
  updateSwapAllowance: (allowance: BigNumber) =>
    set(() => ({
      Allowance: allowance,
    })),

  updateSwapAmount: (amount: BigNumber) =>
    set(() => ({
      Amount: amount,
    })),
    updateLimitAmount: (limit: BigNumber) =>
    set(() => ({
      Limit:limit,
    })),
}));
