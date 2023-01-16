import { useEffect, useState } from 'react';

export interface SmallerPoolIF {
    base: string;
    quote: string;
    poolId?: number;
}

export const useRecentPools = (
    chainId: string,
): {
    addRecentPool: (pool: SmallerPoolIF) => void;
    getRecentPools: (count: number) => SmallerPoolIF[];
    resetRecentPools: () => void;
} => {
    // array of pools the user has interacted with in the current session
    const [recentPools, setRecentPools] = useState<SmallerPoolIF[]>([]);

    // hook to reset recent tokens when the user switches chains
    useEffect(() => resetRecentPools(), [chainId]);

    // fn to add a token to the recentTokens array
    function addRecentPool(pool: SmallerPoolIF): void {
        setRecentPools([pool, ...recentPools]);
    }

    // fn to return recent pools from local state
    function getRecentPools(count: number): SmallerPoolIF[] {
        return recentPools.slice(0, count);
    }

    // fn to clear list of recent pools
    function resetRecentPools(): void {
        setRecentPools([]);
    }

    return {
        addRecentPool,
        getRecentPools,
        resetRecentPools,
    };
};