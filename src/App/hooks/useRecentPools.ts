import { useEffect, useState } from 'react';
import sortTokens from '../../utils/functions/sortTokens';
import { TokenIF } from '../../utils/interfaces/exports';
import { ackTokensMethodsIF } from './useAckTokens';

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
    ackTokens: ackTokensMethodsIF,
): recentPoolsMethodsIF => {
    // array of pools the user has interacted with in the current session
    const [recentPools, setRecentPools] = useState<SmallerPoolIF[]>([]);

    // add pools to the recent pools list (in-session)
    // runs every time to the current token pair changes
    // later this will need more logic for a Pool ID value
    useEffect(() => {
        // sort current token pair as base and quote
        const [baseToken, quoteToken]: TokenIF[] = sortTokens(tokenA, tokenB);
        // logic to determine if a token is on a known list or acknowledged
        const checkToken = (tkn: TokenIF): boolean => {
            const isListed = verifyToken(tkn.address.toLowerCase(), chainId);
            const isAcknowledged = ackTokens.check(tkn);
            return isListed || isAcknowledged;
        };
        // add the pool to the list of recent pools
        // fn has internal logic to handle duplicate values
        if (checkToken(baseToken) && checkToken(quoteToken)) {
            addPool({ baseToken: baseToken, quoteToken: quoteToken });
        }
    }, [tokenA.address, tokenB.address]);

    // fn to add a token to the recentTokens array
    function addPool(pool: SmallerPoolIF): void {
        // remove the current pool from the list, if present
        // this prevents duplicate entries
        const recentPoolsWithNewRemoved = recentPools.filter(
            (recentPool: SmallerPoolIF) =>
                recentPool.baseToken.address.toLowerCase() !==
                    pool.baseToken.address.toLowerCase() ||
                recentPool.quoteToken.address.toLowerCase() !==
                    pool.quoteToken.address.toLowerCase() ||
                recentPool.baseToken.chainId !== pool.baseToken.chainId ||
                recentPool.quoteToken.chainId !== pool.quoteToken.chainId,
        );
        // add the current pool to the front of the list
        setRecentPools([pool, ...recentPoolsWithNewRemoved]);
    }

    // fn to return recent pools from local state
    function getPools(count: number): SmallerPoolIF[] {
        // active conntected chain ID as an integer
        const currentChain: number = parseInt(chainId);
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

    return {
        addPool,
        getPools,
        resetPools,
    };
};
