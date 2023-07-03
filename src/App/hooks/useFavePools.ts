import { useMemo, useState } from 'react';
import { sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import { PoolIF, TokenIF } from '../../utils/interfaces/exports';

export interface favePoolsMethodsIF {
    pools: PoolIF[];
    check: (
        addrTokenA: string,
        addrTokenB: string,
        chainId: string,
        poolId: number,
    ) => boolean;
    add: (
        tokenA: TokenIF,
        tokenB: TokenIF,
        chainId: string,
        poolId: number,
    ) => void;
    remove: (
        tokenA: TokenIF,
        tokenB: TokenIF,
        chainId: string,
        poolId: number,
    ) => void;
}

export const useFavePools = (): favePoolsMethodsIF => {
    // list of favorite pools, will initialize from local storage or use an empty
    // ... array if local storage has no value (for first-time users)
    const [favePools, setFavePools] = useState<PoolIF[]>(
        JSON.parse(localStorage.getItem('favePools') as string) ?? [],
    );

    // fn to remove a PoolIF item from a PoolIF[] array
    // this is not returned from the hook, just to centralize logic
    const removePoolFromArray = (
        targetPool: PoolIF,
        poolsArray: PoolIF[],
    ): PoolIF[] => {
        // comparator fn to use as callback in .filter() method
        // returns `true` if any value does not match between objects
        // returns `false` if all values are identical (meaning pools are identical)
        const comparePools = (pool1: PoolIF, pool2: PoolIF): boolean =>
            pool1.base.address.toLowerCase() !==
                pool2.base.address.toLowerCase() ||
            pool1.quote.address.toLowerCase() !==
                pool2.quote.address.toLowerCase() ||
            pool1.chainId !== pool2.chainId ||
            pool1.poolIdx !== pool2.poolIdx;
        // return filtered array of pools
        return poolsArray.filter((poolFromArray: PoolIF) =>
            comparePools(poolFromArray, targetPool),
        );
    };

    // fn to add a pool to the favorites list (both local state and local storage)
    const addPoolToFaves = (
        tokenA: TokenIF,
        tokenB: TokenIF,
        chainId: string,
        poolId: number,
    ): void => {
        // sort tokenA and tokenB as [base, quote]
        const [baseAddr] = sortBaseQuoteTokens(tokenA.address, tokenB.address);
        const [baseToken, quoteToken]: TokenIF[] =
            baseAddr === tokenA.address ? [tokenA, tokenB] : [tokenB, tokenA];
        // make a pool object from args conforming to PoolIF shape
        const newPool: PoolIF = {
            base: baseToken,
            quote: quoteToken,
            chainId: chainId,
            poolIdx: poolId,
        };
        // local copy of favePools with newPool removed
        const favesWithNewRemoved: PoolIF[] = removePoolFromArray(
            newPool,
            favePools,
        );
        // new array with newPool as the first value
        const updatedPoolsArray: PoolIF[] = [newPool, ...favesWithNewRemoved];
        // send new array of favorite pools to local state and local storage
        setFavePools(updatedPoolsArray);
        localStorage.setItem('favePools', JSON.stringify(updatedPoolsArray));
    };

    // fn to remove a pool from the favorites list (both local state and local storage)
    const removePoolFromFaves = (
        tokenA: TokenIF,
        tokenB: TokenIF,
        chainId: string,
        poolIdx: number,
    ): void => {
        // sort tokenA and tokenB addresses as [base, quote]
        const [baseAddr, quoteAddr] = sortBaseQuoteTokens(
            tokenA.address,
            tokenB.address,
        );
        // local copy of favePools with the specified pool parameters filtered out
        const updatedPoolsArray: PoolIF[] = favePools.filter(
            (pool: PoolIF) =>
                pool.base.address.toLowerCase() !== baseAddr.toLowerCase() ||
                pool.quote.address.toLowerCase() !== quoteAddr.toLowerCase() ||
                pool.chainId !== chainId ||
                pool.poolIdx !== poolIdx,
        );
        // send new array of favorite pools to local state and local storage
        setFavePools(updatedPoolsArray);
        localStorage.setItem('favePools', JSON.stringify(updatedPoolsArray));
    };

    // fn to determine if a pool is favorited according to pool metadata
    const checkFavePools = (
        addrTokenA: string,
        addrTokenB: string,
        chainId: string,
        poolIdx: number,
    ): boolean => {
        // sort token addresses as [base, quote]
        const [baseAddr, quoteAddr]: string[] = sortBaseQuoteTokens(
            addrTokenA,
            addrTokenB,
        );
        // return boolean indicating whether a relevant pool is favorited
        return favePools.some(
            (favePool: PoolIF) =>
                favePool.base.address.toLowerCase() ===
                    baseAddr.toLowerCase() &&
                favePool.quote.address.toLowerCase() ===
                    quoteAddr.toLowerCase() &&
                favePool.chainId === chainId &&
                favePool.poolIdx === poolIdx,
        );
    };

    return useMemo(
        () => ({
            pools: favePools,
            check: checkFavePools,
            add: addPoolToFaves,
            remove: removePoolFromFaves,
        }),
        [favePools],
    );
};
