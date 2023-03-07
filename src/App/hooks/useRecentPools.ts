import { useEffect, useState } from 'react';
import { sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import { tokenMethodsIF } from './useToken';

export interface SmallerPoolIF {
    base: string;
    quote: string;
    poolId?: number;
}

export const useRecentPools = (
    chainId: string,
    addressTokenA: string,
    addressTokenB: string,
    uTokens: tokenMethodsIF
): {
    addRecentPool: (pool: SmallerPoolIF) => void;
    getRecentPools: (count: number) => SmallerPoolIF[];
    resetRecentPools: () => void;
} => {
    // array of pools the user has interacted with in the current session
    const [recentPools, setRecentPools] = useState<SmallerPoolIF[]>([]);

    // TODO:   @Emily  does this really need to be in a useEffect() hook? if it
    // TODO:   @Emily  ... needs to be recalculated when either base or quote
    // TODO:   @Emily  ... tokens change that should happen automatically
    // add pools to the recent pools list (in-session)
    // runs every time to the current token pair changes
    // later this will need more logic for a Pool ID value
    useEffect(() => {
        // sort current token pair as base and quote
        const [baseAddr, quoteAddr] = sortBaseQuoteTokens(addressTokenA, addressTokenB);
        // check whether both tokens are on a known list or user-acknowledged
        const tokensVerified = [baseAddr, quoteAddr].every(
            (addr: string) => uTokens.verifyToken(addr, chainId)
        );
            // uTokens.verifyToken(baseAddr, chainId) &&
            // uTokens.verifyToken(quoteAddr, chainId);
        // add the pool to the list of recent pools
        // fn has internal logic to handle duplicate values
        tokensVerified && addRecentPool({ base: baseAddr, quote: quoteAddr });
    }, [addressTokenA, addressTokenB]);

    // hook to reset recent tokens when the user switches chains
    // useEffect(() => resetRecentPools(), [chainId]);

    // fn to add a token to the recentTokens array
    function addRecentPool(pool: SmallerPoolIF): void {
        // remove the current pool from the list, if present
        // this prevents duplicate entries
        const recentPoolsWithNewRemoved = recentPools.filter(
            (recentPool: SmallerPoolIF) =>
                recentPool.base.toLowerCase() !== pool.base.toLowerCase() ||
                recentPool.quote.toLowerCase() !== pool.quote.toLowerCase(),
        );
        // add the current pool to the front of the list
        setRecentPools([pool, ...recentPoolsWithNewRemoved]);
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
