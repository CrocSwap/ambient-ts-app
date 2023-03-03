import { useState } from 'react';
import { sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import { PoolIF, TokenIF } from '../../utils/interfaces/exports';

export const useFavePools = () => {
    const [favePools, setFavePools] = useState<PoolIF[]>(
        JSON.parse(localStorage.getItem('favePools') as string) ?? []
    );

    function addPoolToFaves (tokenA: TokenIF, tokenB: TokenIF, chainId: string, poolId: number) {
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
                pool.base.address !== baseAddr ||
                pool.quote.address !== quoteAddr ||
                pool.chainId !== chainId ||
                pool.poolId !== poolId,
        );
        setFavePools(updatedPoolsArray);
        localStorage.setItem('favePools', JSON.stringify(updatedPoolsArray));
    };

    const checkFavePools = (
        tokenA: TokenIF,
        tokenB: TokenIF,
        chainId: string,
        poolId: number,
    ) => {
        const [baseAddr, quoteAddr] = sortBaseQuoteTokens(tokenA.address, tokenB.address);
        return favePools.some((favePool: PoolIF) => (
            favePool.base.address === baseAddr &&
            favePool.quote.address === quoteAddr &&
            favePool.chainId === chainId &&
            favePool.poolId === poolId
        ));
    };

    return {
        favePools,
        checkFavePools,
        addPoolToFaves,
        removePoolFromFaves
    };
};
