import { useEffect, useState } from 'react';
import { sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import { PoolIF, TokenIF } from '../../utils/interfaces/exports';

export const useFavePools = () => {
    const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('user') as string));
    const [favePools, setFavePools] = useState(userData?.favePools);
    useEffect(() => {
        function getUserData() {
            localStorage.user
                ? setUserData(JSON.parse(localStorage.getItem('user') as string))
                : getUserData();
        }
        getUserData();
    }, []);
    useEffect(() => {
        userData && setFavePools(userData.favePools);
    }, [userData]);

    const addPoolToFaves = (tokenA: TokenIF, tokenB: TokenIF, chainId: string, poolId: number) => {
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
        userData.favePools = updatedPoolsArray;
        localStorage.setItem('user', JSON.stringify(userData));
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
        userData.favePools = updatedPoolsArray;
        localStorage.setItem('user', JSON.stringify(userData));
    };

    return [favePools, addPoolToFaves, removePoolFromFaves];
};
