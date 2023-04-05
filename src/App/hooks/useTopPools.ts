import { useEffect, useState } from 'react';
import { defaultTopPools } from '../../utils/data/defaultTopPools';
import { TokenIF } from '../../utils/interfaces/exports';

export interface topPoolIF {
    name: string;
    base: TokenIF;
    quote: TokenIF;
    chainId: string;
    poolId: number;
    speed: number;
    id: number;
}

export interface topPoolsMethodsIF {
    all: topPoolIF[];
    onActiveChain: topPoolIF[];
    getByChain: (c: string) => topPoolIF[];
}

export const useTopPools = (chainId: string): topPoolsMethodsIF => {
    // !important   this file uses a roundabout way to hold top pools in local
    // !important   ... state to support future extensibility, as in production
    // !important   ... this data will likely be provided through an async fetch

    // hook to hold array of top pools
    const [topPools, setTopPools] = useState<topPoolIF[]>([]);

    // after initial render, get top pools and send to local state
    // right now this uses a list hardcoded in the front
    useEffect(() => {
        setTopPools(defaultTopPools);
    }, []);

    // fn to return pools on a given chain (by chainId value)
    const getPoolsByChain = (chn: string): topPoolIF[] =>
        topPools.filter((topPool: topPoolIF) => topPool.chainId === chn);

    return {
        all: topPools,
        onActiveChain: getPoolsByChain(chainId),
        getByChain: (c: string) => getPoolsByChain(c),
    };
};
