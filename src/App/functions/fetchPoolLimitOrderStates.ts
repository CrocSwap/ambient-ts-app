interface IFetchPoolLimitOrderStatesProps {
    chainId: string;
    base: string;
    quote: string;
    poolIdx: number;
    ensResolution: boolean;
}

export const fetchPoolLimitOrderStates = (props: IFetchPoolLimitOrderStatesProps) => {
    const { chainId, base, quote, poolIdx, ensResolution } = props;

    const poolLimitOrderStatesCacheEndpoint =
        'https://809821320828123.de:5000' + '/pool_limit_order_states?';

    console.log('fetching pool recent changes');

    const poolLimitOrderStates = fetch(
        poolLimitOrderStatesCacheEndpoint +
            new URLSearchParams({
                chainId: chainId,
                base: base,
                quote: quote,
                poolIdx: poolIdx.toString(),
                ensResolution: ensResolution.toString(),
                omitEmpty: 'true',
            }),
    )
        .then((response) => response?.json())
        .then((json) => {
            const poolLimitOrderJsonData = json?.data;
            return poolLimitOrderJsonData;
        })
        .catch(console.log);

    return poolLimitOrderStates;
};
