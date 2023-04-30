import { GRAPHCACHE_URL } from '../../constants';

export const getChainStatsFresh = async (chainId: string) => {
    return fetch(
        GRAPHCACHE_URL +
            '/chain_stats_fresh?' +
            new URLSearchParams({
                lookback: '10000000',
                chainId: chainId,
            }),
    )
        .then((response) => response?.json())
        .then((json) => {
            const dexStats = json?.data;
            return dexStats;
        })
        .catch(console.error);
};
