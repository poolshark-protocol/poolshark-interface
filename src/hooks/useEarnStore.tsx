import { create } from "zustand";
import { tokenSwap } from "../utils/types";
import { BN_ZERO } from "../utils/math/constants";

type EarnState = {
    // token to be claimed as vested rewards
    tokenClaim: tokenSwap;
    // FIN rewards
    userSeason0Block1FINTotal: number;
    userSeason0Block1FIN: {
        whitelistedFeesUsd: number
        nonWhitelistedFeesUsd: number
        stakingPoints: number
        volumeTradedUsd: number
    };
    // FIN rewards
    totalSeason0Block1FIN: {
        whitelistedFeesUsd: number
        nonWhitelistedFeesUsd: number
        stakingPoints: number
        volumeTradedUsd: number
    };
    // USD values
    userSeason0Block1Points: {
        whitelistedFeesUsd: number
        nonWhitelistedFeesUsd: number
        stakingPoints: number
        volumeTradedUsd: number
    };
    // USD values
    totalSeason0Block1Points: {
        whitelistedFeesUsd: number
        nonWhitelistedFeesUsd: number
        stakingPoints: number
        volumeTradedUsd: number
    };
    userSeason0Block2FINTotal: number;
    userSeason0Block2FIN: {
        whitelistedFeesUsd: number
        nonWhitelistedFeesUsd: number
        stakingPoints: number
        volumeTradedUsd: number
    };
    // FIN rewards
    totalSeason0Block2FIN: {
        whitelistedFeesUsd: number
        nonWhitelistedFeesUsd: number
        stakingPoints: number
        volumeTradedUsd: number
    };
    // USD values
    userSeason0Block2Points: {
        whitelistedFeesUsd: number
        nonWhitelistedFeesUsd: number
        stakingPoints: number
        volumeTradedUsd: number
    };
    // USD values
    totalSeason0Block2Points: {
        whitelistedFeesUsd: number
        nonWhitelistedFeesUsd: number
        stakingPoints: number
        volumeTradedUsd: number
    };
};

type EarnAction = {
    setTokenClaim: (tokenClaim: any) => void;
    setUserSeason0Block1FIN: (userSeason0Block1FIN: any) => void;
    setUserSeason0Block1FINTotal: (userSeason0Block1FINTotal: number) => void;
    setUserSeason0Block1Points: (userSeason0Block1Points: any) => void;
    setTotalSeason0Block1Points: (totalSeason0Block1Points: any) => void;
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
    userSeason0Block1FINTotal: 0,
    userSeason0Block1FIN: {
        whitelistedFeesUsd: 0,
        nonWhitelistedFeesUsd: 0,
        stakingPoints: 0,
        volumeTradedUsd: 0,
    },
    // FIN rewards
    totalSeason0Block1FIN: {
        whitelistedFeesUsd: 0,
        nonWhitelistedFeesUsd: 0,
        stakingPoints: 0,
        volumeTradedUsd: 0,
    },
    // USD values
    userSeason0Block1Points: {
        whitelistedFeesUsd: 0,
        nonWhitelistedFeesUsd: 0,
        stakingPoints: 0,
        volumeTradedUsd: 0,
    },
    // USD values
    totalSeason0Block1Points: {
        whitelistedFeesUsd: 0,
        nonWhitelistedFeesUsd: 0,
        stakingPoints: 0,
        volumeTradedUsd: 0,
    },
    userSeason0Block2FINTotal: 0,
    userSeason0Block2FIN: {
        whitelistedFeesUsd: 0,
        nonWhitelistedFeesUsd: 0,
        stakingPoints: 0,
        volumeTradedUsd: 0,
    },
    // FIN rewards
    totalSeason0Block2FIN: {
        whitelistedFeesUsd: 0,
        nonWhitelistedFeesUsd: 0,
        stakingPoints: 0,
        volumeTradedUsd: 0,
    },
    // USD values
    userSeason0Block2Points: {
        whitelistedFeesUsd: 0,
        nonWhitelistedFeesUsd: 0,
        stakingPoints: 0,
        volumeTradedUsd: 0,
    },
    // USD values
    totalSeason0Block2Points: {
        whitelistedFeesUsd: 0,
        nonWhitelistedFeesUsd: 0,
        stakingPoints: 0,
        volumeTradedUsd: 0,
    },
};

export const useEarnStore = create<EarnState & EarnAction>((set) => ({
    tokenClaim: initialEarnState.tokenClaim,
    userSeason0Block1FINTotal: initialEarnState.userSeason0Block1FINTotal,
    userSeason0Block1FIN: initialEarnState.userSeason0Block1FIN,
    totalSeason0Block1FIN: initialEarnState.totalSeason0Block1FIN,
    userSeason0Block1Points: initialEarnState.userSeason0Block1Points,
    totalSeason0Block1Points: initialEarnState.totalSeason0Block1Points,
    userSeason0Block2FINTotal: initialEarnState.userSeason0Block2FINTotal,
    userSeason0Block2FIN: initialEarnState.userSeason0Block2FIN,
    totalSeason0Block2FIN: initialEarnState.totalSeason0Block2FIN,
    userSeason0Block2Points: initialEarnState.userSeason0Block2Points,
    totalSeason0Block2Points: initialEarnState.totalSeason0Block2Points,
    setTokenClaim: (tokenClaim: any) => {
        set(() => ({
            tokenClaim: tokenClaim
        }));    
    },
    setUserSeason0Block1FIN(userSeason0Block1FIN: any) {
        set(() => ({
            userSeason0Block1FIN: userSeason0Block1FIN
        }));  
    },
    setUserSeason0Block1FINTotal: (userSeason0Block1FINTotal: number) => {
        set(() => ({
            userSeason0Block1FINTotal: userSeason0Block1FINTotal
        }));
    },
    setUserSeason0Block1Points(userSeason0Block1Points) {
        set(() => ({
            userSeason0Block1Points: userSeason0Block1Points
        }));  
    },
    setTotalSeason0Block1Points(totalSeason0Block1Points) {
        set(() => ({
            totalSeason0Block1Points: totalSeason0Block1Points
        }));  
    },
    setUserSeason0Block2FIN(userSeason0Block2FIN: any) {
        set(() => ({
            userSeason0Block2FIN: userSeason0Block2FIN
        }));  
    },
    setUserSeason0Block2FINTotal: (userSeason0Block2FINTotal: number) => {
        set(() => ({
            userSeason0Block2FINTotal: userSeason0Block2FINTotal
        }));
    },
    setUserSeason0Block2Points(userSeason0Block2Points) {
        set(() => ({
            userSeason0Block2Points: userSeason0Block2Points
        }));  
    },
    setTotalSeason0Block2Points(totalSeason0Block2Points) {
        set(() => ({
            totalSeason0Block2Points: totalSeason0Block2Points
        }));  
    },
}));