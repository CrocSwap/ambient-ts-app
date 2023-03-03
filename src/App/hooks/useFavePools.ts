import { useState } from 'react';
import { sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import { PoolIF, TokenIF } from '../../utils/interfaces/exports';

export interface favePoolsMethodsIF {
    pools: PoolIF[];
    check: (
        addrTokenA: string,
        addrTokenB: string,
        chainId: string,
        poolId: number
    ) => boolean,
    add: (
        tokenA: TokenIF,
        tokenB: TokenIF,
        chainId: string,
        poolId: number
    ) => void,
    remove: (
        tokenA: TokenIF,
        tokenB: TokenIF,
        chainId: string,
        poolId: number
    ) => void,
}

export const useFavePools = (): favePoolsMethodsIF => {
    const [favePools, setFavePools] = useState<PoolIF[]>(
        JSON.parse(localStorage.getItem('favePools') as string) ?? []
    );

    const removePoolFromArray = (targetPool: PoolIF, poolsArray: PoolIF[]) => {
        const comparePools = (pool1: PoolIF, pool2: PoolIF) => (
            pool1.base.address.toLowerCase() !== pool2.base.address.toLowerCase() ||
            pool1.quote.address.toLowerCase() !== pool2.quote.address.toLowerCase() ||
            pool1.chainId !== pool2.chainId ||
            pool1.poolId !== pool2.poolId
        );
        return poolsArray.filter(
            (poolFromArray: PoolIF) => comparePools(poolFromArray, targetPool)
        );
    }

    const addPoolToFaves = (
        tokenA: TokenIF,
        tokenB: TokenIF,
        chainId: string,
        poolId: number
    ) => {
        const [baseAddr] = sortBaseQuoteTokens(tokenA.address, tokenB.address);
        const [baseToken, quoteToken] =
            baseAddr === tokenA.address ? [tokenA, tokenB] : [tokenB, tokenA];
        const newPool = {
            base: baseToken,
            quote: quoteToken,
            chainId: chainId,
            poolId: poolId,
        };
        const favesWithNewRemoved = removePoolFromArray(newPool, favePools);
        const updatedPoolsArray = [newPool, ...favesWithNewRemoved];
        setFavePools(updatedPoolsArray);
        localStorage.setItem('favePools', JSON.stringify(updatedPoolsArray));
    };

    const removePoolFromFaves = (
        tokenA: TokenIF,
        tokenB: TokenIF,
        chainId: string,
        poolId: number,
    ) => {
        const [baseAddr, quoteAddr] = sortBaseQuoteTokens(tokenA.address, tokenB.address);
        const updatedPoolsArray = favePools.filter(
            (pool: PoolIF) =>
                pool.base.address.toLowerCase() !== baseAddr.toLowerCase() ||
                pool.quote.address.toLowerCase() !== quoteAddr.toLowerCase() ||
                pool.chainId !== chainId ||
                pool.poolId !== poolId,
        );
        setFavePools(updatedPoolsArray);
        localStorage.setItem('favePools', JSON.stringify(updatedPoolsArray));
    };

    const checkFavePools = (
        addrTokenA: string,
        addrTokenB: string,
        chainId: string,
        poolId: number,
    ) => {
        const [baseAddr, quoteAddr] = sortBaseQuoteTokens(addrTokenA, addrTokenB);
        return favePools.some((favePool: PoolIF) => (
            favePool.base.address.toLowerCase() === baseAddr.toLowerCase() &&
            favePool.quote.address.toLowerCase() === quoteAddr.toLowerCase() &&
            favePool.chainId === chainId &&
            favePool.poolId === poolId
        ));
    };

    return {
        pools: favePools,
        check: checkFavePools,
        add: addPoolToFaves,
        remove: removePoolFromFaves
    };
};
