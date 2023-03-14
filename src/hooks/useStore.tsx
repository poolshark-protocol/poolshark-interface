import { create } from "zustand";


type State = {
    pool: {
    tokenOneName: string, 
    tokenZeroName: string, 
    tokenOneAddress: string, 
    tokenZeroAddress: string, 
    poolAddress: string,
    }
  }
  
  type Action = {
    updatePool:(pool:State['pool']) => void
  }
  

export const useStore =  create<State & Action>((set) => ({
        pool: {
          tokenOneName: '', 
          tokenZeroName:'', 
          tokenOneAddress: '', 
          tokenZeroAddress: '', 
          poolAddress: '',
          },
      updatePool: (pool: State["pool"]) => set(( ) => ( {
          pool:pool
        }))}));

