import { useState } from 'react';
import { sortBaseQuoteTokens } from '@crocswap-libs/sdk';

export const useFavePools = () => {
    const userData = JSON.parse(localStorage.user);
    const [ favePools, setFavePools ] = useState(userData.favePools);

    const addPoolToFaves = (
        addrTokenA: string,
        addrTokenB: string,
        chainId: string,
        poolId: number
    ) => {
        const [baseAddr, quoteAddr] = sortBaseQuoteTokens(addrTokenA, addrTokenB);
        const newPool = {
            base: baseAddr,
            quote: quoteAddr,
            chainId: chainId,
            poolId: poolId
        };
        const updatedPoolsArray = [...favePools, newPool ];
        setFavePools(updatedPoolsArray);
        userData.favePools = updatedPoolsArray;
        localStorage.setItem('user', JSON.stringify(userData));
    }

    const removePoolFromFaves = (
        addrTokenA: string,
        addrTokenB: string,
        chainId: string,
        poolId: number
    ) => {
        const [baseAddr, quoteAddr] = sortBaseQuoteTokens(addrTokenA, addrTokenB);
        const newPool = {
            base: baseAddr,
            quote: quoteAddr,
            chainId: chainId,
            poolId: poolId
        };
        console.log(newPool);
    }

    return [
        favePools,
        addPoolToFaves,
        removePoolFromFaves
    ];
}