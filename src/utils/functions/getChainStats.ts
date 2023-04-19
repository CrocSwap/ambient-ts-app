export const getChainStatsFresh = async (chainId: string) => {
    return fetch(
        'https://809821320828123.de:5000/chain_stats_fresh?' +
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
