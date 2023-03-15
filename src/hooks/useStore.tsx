import {create} from "zustand";
import { BigNumber, ethers } from "ethers";



interface Pool {
        tokenOneName: string, 
        tokenZeroName: string, 
        tokenOneAddress: string, 
        tokenZeroAddress: string, 
        poolAddress: string,
}

interface ContractParams {
    prevLower: BigNumber
    min: BigNumber,
    prevUpper:  BigNumber,
    max: BigNumber,
    claim:  BigNumber,
    amount: BigNumber,
    inverse: boolean
}



type State = {
    pool: Pool
    contractParams: ContractParams
  }
  
  type Action = {
    updatePool:(pool:Pool) => void
    resetPool:() => void
    resetContractParams:() => void
    updateContractParams:(contractParams:ContractParams) => void
  }

  const initialState: State = {
    pool:  {
        tokenOneName: '', 
        tokenZeroName:'', 
        tokenOneAddress: '', 
        tokenZeroAddress: '', 
        poolAddress: '',
    },
    contractParams : {
        prevLower: ethers.utils.parseUnits("0"),
        min: ethers.utils.parseUnits("20", 0),
        prevUpper: ethers.utils.parseUnits("887272", 0),
        max: ethers.utils.parseUnits("30", 0),
        claim: ethers.utils.parseUnits("20", 0),
        amount: ethers.utils.parseUnits("0", 0),
        inverse:false,
    }
  }
  

export const useStore = create<State & Action>((set) => ({
        pool: initialState.pool ,
        contractParams: initialState.contractParams,
            resetPool:() => {
                set({pool:initialState.pool})
            },
            resetContractParams:() => {
                set({contractParams:initialState.contractParams})
            },
             updatePool: (pool: Pool) => set(( ) => ( {
          pool:pool
        })),
        updateContractParams: (contractParams: ContractParams) => set(() => ({
            contractParams:contractParams

        }))
    
    }));

