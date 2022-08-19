import { useState } from 'react';
import { sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import { PoolIF, TokenIF } from '../../utils/interfaces/exports';

export const useFavePools = () => {
    const userData = JSON.parse(localStorage.user);
    const [ favePools, setFavePools ] = useState(userData.favePools);

    const addPoolToFaves = (
        tokenA: TokenIF,
        tokenB: TokenIF,
        chainId: string,
        poolId: number
    ) => {
        const [baseAddr] = sortBaseQuoteTokens(tokenA.address, tokenB.address);
        const [baseToken, quoteToken] = baseAddr === tokenA.address
            ? [tokenA, tokenB]
            : [tokenB, tokenA];
        const newPool = {
            base: baseToken,
            quote: quoteToken,
            chainId: chainId,
            poolId: poolId
        };
        const updatedPoolsArray = [...favePools, newPool ];
        setFavePools(updatedPoolsArray);
        userData.favePools = updatedPoolsArray;
        localStorage.setItem('user', JSON.stringify(userData));
    }

    const removePoolFromFaves = (
        tokenA: TokenIF,
        tokenB: TokenIF,
        chainId: string,
        poolId: number
    ) => {
        const [baseAddr, quoteAddr] = sortBaseQuoteTokens(tokenA.address, tokenB.address);
        const updatedPoolsArray = favePools.filter((pool: PoolIF) => (
            pool.base.address !== baseAddr ||
            pool.quote.address !== quoteAddr ||
            pool.chainId !== chainId ||
            pool.poolId !== poolId
        ));
        setFavePools(updatedPoolsArray);
        userData.favePools = updatedPoolsArray;
        localStorage.setItem('user', JSON.stringify(userData));
    }

    return [
        favePools,
        addPoolToFaves,
        removePoolFromFaves
    ];
}