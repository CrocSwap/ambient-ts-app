import { useEffect, useState } from 'react';
import { getDefaultTopPools } from '../../utils/data/defaultTopPools';
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

export const useTopPools = (chainId: string): topPoolIF[] => {
    // !important   this file uses a roundabout way to hold top pools in local
    // !important   ... state to support future extensibility, as in production
    // !important   ... this data will likely be provided through an async fetch

    // hook to hold array of top pools
    const [topPools, setTopPools] = useState<topPoolIF[]>([]);

    // after initial render, get top pools and send to local state
    // right now this uses a list hardcoded in the front
    useEffect(() => {
        setTopPools(getDefaultTopPools(chainId));
    }, [chainId]);

    return topPools;
};
