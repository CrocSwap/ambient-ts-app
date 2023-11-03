import { useEffect, useState } from 'react';
import { getDefaultTopPools } from '../../utils/data/defaultTopPools';
import { PoolIF } from '../../utils/interfaces/exports';

// TODO:    I'm pretty sure there's no reason for this to be a hook. all the data
// TODO:    ... consumed is hardcoded in the front, we can probably eliminate this
// TODO:    ... layer from the codebase     -Emily

/* Hook to manage the arbitrairly defined top pools for the specific chain.
 * Consumed in sidebar and home page to give the user a convenient way to
 * see which pools they might want to check out. */
export const useTopPools = (chainId: string): PoolIF[] => {
    const [topPools, setTopPools] = useState<PoolIF[]>([]);
    useEffect(() => {
        setTopPools(getDefaultTopPools(chainId));
    }, [chainId]);
    return topPools;
};
