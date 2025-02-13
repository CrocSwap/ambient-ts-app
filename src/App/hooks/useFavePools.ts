import { sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import { useEffect, useMemo, useState } from 'react';
import { PoolIF, TokenIF } from '../../ambient-utils/types';

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
    const [favePools, setFavePools] = useState<PoolIF[]>([]);

    // necessary due to a change in PoolIF
    const updateLocalStorageOnLoad = () => {
        const storedValue = localStorage.getItem('favePools');

        if (!storedValue) {
            return;
        } else {
            const parsedValue = JSON.parse(storedValue);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const newArray = parsedValue.map((pool: any) => {
                if (typeof pool.base === 'string') return pool;
                return {
                    base: pool.base.address,
                    baseToken: pool.base,
                    quote: pool.quote.address,
                    quoteToken: pool.quote,
                    chainId: pool.chainId,
                    poolIdx: pool.poolIdx,
                };
            });
            setFavePools(newArray);

            localStorage.setItem('favePools', JSON.stringify(newArray));
        }
    };

    useEffect(() => {
        updateLocalStorageOnLoad();
    }, []);

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
            pool1.base.toLowerCase() !== pool2.base.toLowerCase() ||
            pool1.quote.toLowerCase() !== pool2.quote.toLowerCase() ||
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
            base: baseToken.address,
            quote: quoteToken.address,
            baseToken,
            quoteToken,
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
                pool.base.toLowerCase() !== baseAddr.toLowerCase() ||
                pool.quote.toLowerCase() !== quoteAddr.toLowerCase() ||
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
                favePool.base.toLowerCase() === baseAddr.toLowerCase() &&
                favePool.quote.toLowerCase() === quoteAddr.toLowerCase() &&
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
