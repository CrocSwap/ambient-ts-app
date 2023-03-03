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

    // TODO:   @Emily  this fn needs logic to not add a pool if it exists already
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
        const updatedPoolsArray = [newPool, ...favePools];
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
