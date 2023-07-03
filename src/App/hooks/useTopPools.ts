import { useEffect, useState } from 'react';
import { getDefaultTopPools } from '../../utils/data/defaultTopPools';
import { TokenIF } from '../../utils/interfaces/exports';

export interface topPoolIF {
    name: string;
    base: TokenIF;
    quote: TokenIF;
    chainId: string;
    poolIdx: number;
    speed: number;
    id: number;
}

/* Hook to manage the arbitrairly defined top pools for the specific chain.
 * Consumed in sidebar and home page to give the user a convenient way to
 * see which pools they might want to check out. */
export const useTopPools = (chainId: string): topPoolIF[] => {
    const [topPools, setTopPools] = useState<topPoolIF[]>([]);
    useEffect(() => {
        setTopPools(getDefaultTopPools(chainId));
    }, [chainId]);
    return topPools;
};
