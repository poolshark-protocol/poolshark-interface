import { create } from 'zustand'
import { BigNumber, ethers } from 'ethers'

type Pool = {
  poolAddress: string
  tokenZeroName: string
  tokenZeroAddress: string
  tokenZeroSymbol: string
  tokenOneName: string
  tokenOneAddress: string
  tokenOneSymbol: string
}

type CoverContractParams = {
  prevLower: BigNumber
  min: BigNumber
  prevUpper: BigNumber
  max: BigNumber
  claim: BigNumber
  amount: BigNumber
  inverse: boolean
}

type RangeContractParams = {
  to: string
  min: BigNumber
  max: BigNumber
  amount0: BigNumber
  amount1: BigNumber
  fungible: true
}

type SwapParams = {
  tokenOneName: string
  tokenZeroName: string
  tokenOneAddress: string
  tokenZeroAddress: string
}

type SwapState = {
  SwapParams: SwapParams
  Allowance: BigNumber
  Amount: BigNumber
  Limit: BigNumber
}

type SwapAction = {
  updateSwapParams: (SwapParams: SwapParams) => void
  updateSwapAmount: (amount: BigNumber) => void
  updateSwapAllowance: (allowance: BigNumber) => void
  updateLimitAmount: (limit: BigNumber) => void
  resetSwapParams: () => void
}

const initialSwapState: SwapState = {
  SwapParams: {
    tokenOneName: '',
    tokenZeroName: '',
    tokenOneAddress: '',
    tokenZeroAddress: '',
  },
  Allowance: BigNumber.from(0),
  Amount: BigNumber.from(0),
  Limit: BigNumber.from(0),
}

type CoverState = {
  pool: Pool
  coverContractParams: CoverContractParams
  CoverAllowance: BigNumber
}

type RangeState = {
  pool: Pool
  rangeContractParams: RangeContractParams
  RangeAllowance: BigNumber
}

type CoverAction = {
  updatePool: (pool: Pool) => void
  resetPool: () => void
  resetCoverContractParams: () => void
  updateCoverContractParams: (coverContractParams: CoverContractParams) => void
  updateCoverAllowance: (allowance: BigNumber) => void
}

type RangeAction = {
  updatePool: (pool: Pool) => void
  resetPool: () => void
  resetRangeContractParams: () => void
  updateRangeContractParams: (rangeContractParams: RangeContractParams) => void
  updateRangeAllowance: (allowance: BigNumber) => void
}

const initialCoverState: CoverState = {
  pool: {
    poolAddress: '',
    tokenZeroName: '',
    tokenZeroAddress: '',
    tokenZeroSymbol: '',
    tokenOneName: '',
    tokenOneAddress: '',
    tokenOneSymbol: '',
  },
  coverContractParams: {
    prevLower: ethers.utils.parseUnits('0'),
    min: ethers.utils.parseUnits('20', 0),
    prevUpper: ethers.utils.parseUnits('887272', 0),
    max: ethers.utils.parseUnits('30', 0),
    claim: ethers.utils.parseUnits('20', 0),
    amount: ethers.utils.parseUnits('0', 0),
    inverse: false,
  },
  CoverAllowance: BigNumber.from(0),
}

const initialRangeState: RangeState = {
  pool: {
    poolAddress: '',
    tokenZeroName: '',
    tokenZeroAddress: '',
    tokenZeroSymbol: '',
    tokenOneName: '',
    tokenOneAddress: '',
    tokenOneSymbol: '',
  },
  rangeContractParams: {
    to: '',
    min: ethers.utils.parseUnits('20', 0),
    max: ethers.utils.parseUnits('30', 0),
    amount0: ethers.utils.parseUnits('0', 0),
    amount1: ethers.utils.parseUnits('0', 0),
    fungible: true,
  },
  RangeAllowance: BigNumber.from(0),
}

export const useCoverStore = create<CoverState & CoverAction>((set) => ({
  pool: initialCoverState.pool,
  CoverAllowance: initialCoverState.CoverAllowance,
  coverContractParams: initialCoverState.coverContractParams,
  resetPool: () => {
    set({ pool: initialCoverState.pool })
  },
  resetCoverContractParams: () => {
    set({ coverContractParams: initialCoverState.coverContractParams })
  },
  updatePool: (pool: Pool) =>
    set(() => ({
      pool: pool,
    })),
  updateCoverContractParams: (coverContractParams: CoverContractParams) =>
    set(() => ({
      coverContractParams: coverContractParams,
    })),
  updateCoverAllowance: (allowance: BigNumber) =>
    set(() => ({
      CoverAllowance: allowance,
    })),
}))

export const useRangeStore = create<RangeState & RangeAction>((set) => ({
  pool: initialRangeState.pool,
  RangeAllowance: initialRangeState.RangeAllowance,
  rangeContractParams: initialRangeState.rangeContractParams,
  resetPool: () => {
    set({ pool: initialRangeState.pool })
  },
  resetRangeContractParams: () => {
    set({ rangeContractParams: initialRangeState.rangeContractParams })
  },
  updatePool: (pool: Pool) =>
    set(() => ({
      pool: pool,
    })),
  updateRangeContractParams: (rangeContractParams: RangeContractParams) =>
    set(() => ({
      rangeContractParams: rangeContractParams,
    })),
  updateRangeAllowance: (allowance: BigNumber) =>
    set(() => ({
      RangeAllowance: allowance,
    })),
}))

export const useSwapStore = create<SwapState & SwapAction>((set) => ({
  SwapParams: initialSwapState.SwapParams,
  Allowance: initialSwapState.Allowance,
  Amount: initialSwapState.Amount,
  Limit: initialSwapState.Limit,
  resetSwapParams: () => {
    set({ SwapParams: initialSwapState.SwapParams })
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
      Limit: limit,
    })),
}))
