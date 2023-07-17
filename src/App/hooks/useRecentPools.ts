import { sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import { useMemo, useState } from 'react';
import { PoolIF, TokenIF } from '../../utils/interfaces/exports';
import sortTokens from '../../utils/functions/sortTokens';

export interface recentPoolsMethodsIF {
    add: (
        tokenA: TokenIF,
        tokenB: TokenIF,
        chainId: string,
        poolId: number,
    ) => void;
    get: (count: number) => PoolIF[];
    reset: () => void;
}

// !important:  logic to prevent addition of non-existent pools has been relocated
// !important:  ... from this file to the in-situ function call of `addPool` in the
// !important:  ... PageHeader.tsx file to (A) prevent a flash in the sidebar when
// !important:  ... updating and (B) to allow us to force a token pair into the recent
// !important:  ... token list should the need ever

// Hook for maintaining a list of pools the user has accessed during this session.
// Pools are sorted in order from most recently to least recently used. Viewing any
//  pool-related page will bump that pool to the front of the list.
export const useRecentPools = (chainId: string): recentPoolsMethodsIF => {
    // array of pools the user has interacted with in the current session
    const [recentPools, setRecentPools] = useState<PoolIF[]>([]);

    // fn to add a token to the recentTokens array
    function addPool(
        tokenA: TokenIF,
        tokenB: TokenIF,
        chainId: string,
        poolId: number,
    ): void {
        // Necessary because tokenA and tokenB are dispatched separately and
        // during switch may temporarily have the same value
        if (tokenA.address === tokenB.address) {
            return;
        }

        const [baseTokenAddr, quoteTokenAddr] = sortBaseQuoteTokens(
            tokenA.address,
            tokenB.address,
        );

        const [baseToken, quoteToken] = sortTokens(tokenA, tokenB);

        const nextPool: PoolIF = {
            base: baseToken,
            quote: quoteToken,
            chainId,
            poolIdx: poolId,
        };

        function matchPools(pool: PoolIF): boolean {
            return (
                pool.base.address.toLowerCase() ===
                    baseTokenAddr.toLowerCase() &&
                pool.quote.address.toLowerCase() ===
                    quoteTokenAddr.toLowerCase() &&
                pool.chainId === baseToken.chainId.toString()
            );
        }

        if (recentPools.length == 0) {
            // Initialize empty list
            setRecentPools([nextPool]);
        } else if (matchPools(recentPools[0])) {
            // Do nothing because front matches
        } else {
            // Remove the pool (if previously present) and move to the front of the list
            const removed = recentPools.filter((pool) => !matchPools(pool));
            setRecentPools([nextPool, ...removed]);
        }
    }

    // fn to return recent pools from local state
    function getPools(count: number): PoolIF[] {
        // active conntected chain ID as an integer
        const currentChain: number = parseInt(chainId);
        // filter out pairs for which a pool does not yet exist
        // return a set number of pools on the current active chain
        return recentPools
            .filter(
                (pool: PoolIF) =>
                    pool.base.chainId === currentChain &&
                    pool.quote.chainId === currentChain,
            )
            .slice(0, count);
    }

    // fn to clear list of recent pools
    function resetPools(): void {
        setRecentPools([]);
    }

    return useMemo(
        () => ({
            add: addPool,
            get: getPools,
            reset: resetPools,
        }),
        [recentPools],
    );
};
