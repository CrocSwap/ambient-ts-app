import { useEffect, useState } from 'react';
import { sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import { TokenIF } from '../../utils/interfaces/exports';

export interface SmallerPoolIF {
    base: string;
    quote: string;
    poolId?: number;
}

export const useRecentPools = (
    chainId: string,
    addressTokenA: string,
    addressTokenB: string,
    verifyToken: (addr: string, chn: string) => boolean,
): {
    addRecentPool: (pool: SmallerPoolIF) => void;
    getRecentPools: (count: number) => SmallerPoolIF[];
    resetRecentPools: () => void;
} => {
    // array of pools the user has interacted with in the current session
    const [recentPools, setRecentPools] = useState<SmallerPoolIF[]>([]);
    // recentPools.length || setRecentPools([{
    //     base: sortBaseQuoteTokens(addressTokenA, addressTokenB)[0],
    //     quote: sortBaseQuoteTokens(addressTokenA, addressTokenB)[1]
    // }]);

    // add pools to the recent pools list (in-session)
    // runs every time to the current token pair changes
    // later this will need more logic for a Pool ID value
    useEffect(() => {
        // sort current token pair as base and quote
        const [baseAddr, quoteAddr] = sortBaseQuoteTokens(addressTokenA, addressTokenB);
        const { ackTokens } = JSON.parse(localStorage.getItem('user') as string) ?? [];
        const checkToken = (addr: string) => {
            const isListed = verifyToken(addr.toLowerCase(), chainId);
            const isAcknowledged = ackTokens?.some(
                (ackTkn: TokenIF) =>
                    ackTkn.address.toLowerCase() === addr.toLowerCase() &&
                    ackTkn.chainId === parseInt(chainId),
            );
            return isListed || isAcknowledged;
        };
        // add the pool to the list of recent pools
        // fn has internal logic to handle duplicate values
        if (checkToken(baseAddr) && checkToken(quoteAddr)) {
            addRecentPool({ base: baseAddr, quote: quoteAddr });
        }
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
