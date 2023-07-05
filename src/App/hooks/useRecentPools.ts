import { sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import { useMemo, useState } from 'react';
import { TokenIF } from '../../utils/interfaces/exports';

export interface SmallerPoolIF {
    baseToken: TokenIF;
    quoteToken: TokenIF;
}

export interface recentPoolsMethodsIF {
    addPool: (tokenA: TokenIF, tokenB: TokenIF) => void;
    getPools: (count: number) => SmallerPoolIF[];
    resetPools: () => void;
}

// Hook for maintaining a list of pools the user has accessed during this session.
// Pools are sorted in order from most recently to least recently used. Viewing any
//  pool-related page will bump that pool to the front of the list.
export const useRecentPools = (chainId: string): recentPoolsMethodsIF => {
    // array of pools the user has interacted with in the current session
    const [recentPools, setRecentPools] = useState<SmallerPoolIF[]>([]);

    // fn to add a token to the recentTokens array
    function addPool(tokenA: TokenIF, tokenB: TokenIF): void {
        // Necessary because tokenA and tokenB are dispatched separately and
        // during switch may temporarily have the same value
        if (tokenA.address === tokenB.address) {
            return;
        }

        const [baseTokenAddr, quoteTokenAddr] = sortBaseQuoteTokens(
            tokenA.address,
            tokenB.address,
        );

        const [baseToken, quoteToken] =
            baseTokenAddr === tokenA.address
                ? [tokenA, tokenB]
                : [tokenB, tokenA];
        const nextPool = { baseToken: baseToken, quoteToken: quoteToken };

        function poolMatches(pool: SmallerPoolIF) {
            return (
                pool.baseToken.address.toLowerCase() ===
                    baseTokenAddr.toLowerCase() &&
                pool.quoteToken.address.toLowerCase() ===
                    quoteTokenAddr.toLowerCase() &&
                pool.baseToken.chainId === baseToken.chainId
            );
        }

        if (recentPools.length == 0) {
            // Initialize empty list
            setRecentPools([nextPool]);
        } else if (poolMatches(recentPools[0])) {
            // Do nothing because front matches
        } else {
            // Remove the pool (if previously present) and move to the front of the list
            const removed = recentPools.filter((pool) => !poolMatches(pool));
            setRecentPools([nextPool, ...removed]);
        }
    }

    // fn to return recent pools from local state
    function getPools(count: number): SmallerPoolIF[] {
        // active conntected chain ID as an integer
        const currentChain: number = parseInt(chainId);
        // filter out pairs for which a pool does not yet exist
        // return a set number of pools on the current active chain
        return recentPools
            .filter(
                (pool: SmallerPoolIF) =>
                    pool.baseToken.chainId === currentChain &&
                    pool.quoteToken.chainId === currentChain,
            )
            .slice(0, count);
    }

    // fn to clear list of recent pools
    function resetPools(): void {
        setRecentPools([]);
    }

    return useMemo(
        () => ({
            addPool,
            getPools,
            resetPools,
        }),
        [recentPools],
    );
};
