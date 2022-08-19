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
        console.log({
            base: baseAddr,
            quote: quoteAddr,
            chainId: chainId,
            poolId: poolId
        });
        //  make a new array of all fave pools with new addition and expansion operator
        //  update local state with the new array
        // setFavePools([
        //     ...favePools,
        //     {
        //         base: baseAddr,
        //         quote: quoteAddr,
        //         chainId: chainId,
        //         poolId: poolId
        //     }
        // ]);
        // assign the value to userData.favePools and write to local storage
    }

    const removePoolFromFaves = (
        addrTokenA: string,
        addrTokenB: string,
        chainId: string,
        poolId: number
    ) => {
        const [baseAddr, quoteAddr] = sortBaseQuoteTokens(addrTokenA, addrTokenB);
        console.log({
            base: baseAddr,
            quote: quoteAddr,
            chainId: chainId,
            poolId: poolId
        });
        //  make a new array of all fave pools with pool removed via Array.filter()
        //  update local state with the new array
        setFavePools([]);
        // assign the value to userData.favePools and write to local storage
    }

    return [
        favePools,
        addPoolToFaves,
        removePoolFromFaves
    ];
}