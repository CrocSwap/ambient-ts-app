import { useEffect, useState } from 'react';
import sortTokens from '../../utils/functions/sortTokens';
import { TokenIF } from '../../utils/interfaces/exports';

export interface SmallerPoolIF {
    baseToken: TokenIF;
    quoteToken: TokenIF;
    poolId?: number;
}

export interface recentPoolsMethodsIF {
    addPool: (pool: SmallerPoolIF) => void;
    getPools: (count: number) => SmallerPoolIF[];
    resetPools: () => void;
}

export const useRecentPools = (
    chainId: string,
    tokenA: TokenIF,
    tokenB: TokenIF,
    verifyToken: (addr: string, chn: string) => boolean,
): recentPoolsMethodsIF => {
    // array of pools the user has interacted with in the current session
    const [recentPools, setRecentPools] = useState<SmallerPoolIF[]>([]);

    // add pools to the recent pools list (in-session)
    // runs every time to the current token pair changes
    // later this will need more logic for a Pool ID value
    useEffect(() => {
        // sort current token pair as base and quote
        const [baseToken, quoteToken]: TokenIF[] = sortTokens(tokenA, tokenB);
        const { ackTokens } =
            JSON.parse(localStorage.getItem('user') as string) ?? [];
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
        if (checkToken(baseToken.address) && checkToken(quoteToken.address)) {
            addPool({ baseToken: baseToken, quoteToken: quoteToken });
        }
    }, [tokenA.address, tokenB.address]);

    // hook to reset recent tokens when the user switches chains
    // useEffect(() => resetPools(), [chainId]);

    // fn to add a token to the recentTokens array
    function addPool(pool: SmallerPoolIF): void {
        // remove the current pool from the list, if present
        // this prevents duplicate entries
        const recentPoolsWithNewRemoved = recentPools.filter(
            (recentPool: SmallerPoolIF) =>
                recentPool.baseToken.address.toLowerCase() !==
                    pool.baseToken.address.toLowerCase() ||
                recentPool.quoteToken.address.toLowerCase() !==
                    pool.quoteToken.address.toLowerCase(),
        );
        // add the current pool to the front of the list
        setRecentPools([pool, ...recentPoolsWithNewRemoved]);
    }

    // fn to return recent pools from local state
    function getPools(count: number): SmallerPoolIF[] {
        return recentPools.slice(0, count);
    }

    // fn to clear list of recent pools
    function resetPools(): void {
        setRecentPools([]);
    }

    return {
        addPool,
        getPools,
        resetPools,
    };
};
