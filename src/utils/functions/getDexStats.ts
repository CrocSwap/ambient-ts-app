export const getDexStatsFresh = async () => {
    console.log('fetching dex stats fresh');
    return fetch(
        'https://809821320828123.de:5000/dex_stats_fresh?' +
            new URLSearchParams({
                lookback: '10000000',
            }),
    )
        .then((response) => response?.json())
        .then((json) => {
            const dexStats = json?.data;
            return dexStats;
        })
        .catch(console.log);
};
