import { create } from "zustand";
import { tokenSwap } from "../utils/types";
import { BN_ZERO } from "../utils/math/constants";

type EarnState = {
    // token to be claimed as vested rewards
    tokenClaim: tokenSwap;
    // FIN rewards
    userSeason1FINTotal: number;
    userSeason1FIN: {
        whitelistedFeesUsd: number
        nonWhitelistedFeesUsd: number
        stakingPoints: number
        volumeTradedUsd: number
    };
    // FIN rewards
    totalSeason1FIN: {
        whitelistedFeesUsd: number
        nonWhitelistedFeesUsd: number
        stakingPoints: number
        volumeTradedUsd: number
    };
    // USD values
    userSeason1Points: {
        whitelistedFeesUsd: number
        nonWhitelistedFeesUsd: number
        stakingPoints: number
        volumeTradedUsd: number
    };
    // USD values
    totalSeason1Points: {
        whitelistedFeesUsd: number
        nonWhitelistedFeesUsd: number
        stakingPoints: number
        volumeTradedUsd: number
    };
};

type EarnAction = {
    setTokenClaim: (tokenClaim: any) => void;
    setUserSeason1FIN: (userSeason1FIN: any) => void;
    setUserSeason1FINTotal: (userSeason1FINTotal: number) => void;
    setUserSeason1Points: (userSeason1Points: any) => void;
    setTotalSeason1Points: (totalSeason1Points: any) => void;
}

const initialEarnState: EarnState = {
    tokenClaim: {
        callId: 0,
        name: 'FIN Season 1 OLM',
        symbol: 'oFIN',
        decimals: 18,
        userBalance: 0,
        logoURI: '',
        address: '0x',
        USDPrice: 0,
        userRouterAllowance: BN_ZERO,
        native: false
    },
    userSeason1FINTotal: 0,
    userSeason1FIN: {
        whitelistedFeesUsd: 0,
        nonWhitelistedFeesUsd: 0,
        stakingPoints: 0,
        volumeTradedUsd: 0,
    },
    // FIN rewards
    totalSeason1FIN: {
        whitelistedFeesUsd: 240000,
        nonWhitelistedFeesUsd: 108000,
        stakingPoints: 48000,
        volumeTradedUsd: 72000,
    },
    // USD values
    userSeason1Points: {
        whitelistedFeesUsd: 0,
        nonWhitelistedFeesUsd: 0,
        stakingPoints: 0,
        volumeTradedUsd: 0,
    },
    // USD values
    totalSeason1Points: {
        whitelistedFeesUsd: 0,
        nonWhitelistedFeesUsd: 0,
        stakingPoints: 0,
        volumeTradedUsd: 0,
    },
};

export const useEarnStore = create<EarnState & EarnAction>((set) => ({
    tokenClaim: initialEarnState.tokenClaim,
    userSeason1FINTotal: initialEarnState.userSeason1FINTotal,
    userSeason1FIN: initialEarnState.userSeason1FIN,
    totalSeason1FIN: initialEarnState.totalSeason1FIN,
    userSeason1Points: initialEarnState.userSeason1Points,
    totalSeason1Points: initialEarnState.totalSeason1Points,
    setTokenClaim: (tokenClaim: any) => {
        set(() => ({
            tokenClaim: tokenClaim
        }));    
    },
    setUserSeason1FIN(userSeason1FIN: any) {
        set(() => ({
            userSeason1FIN: userSeason1FIN
        }));  
    },
    setUserSeason1FINTotal: (userSeason1FINTotal: number) => {
        set(() => ({
            userSeason1FINTotal: userSeason1FINTotal
        }));
    },
    setUserSeason1Points(userSeason1Points) {
        set(() => ({
            userSeason1Points: userSeason1Points
        }));  
    },
    setTotalSeason1Points(totalSeason1Points) {
        set(() => ({
            totalSeason1Points: totalSeason1Points
        }));  
    },
}));