import { IS_LOCAL_ENV } from '../../constants';

interface IFetchPoolLimitOrderStatesProps {
    chainId: string;
    base: string;
    quote: string;
    poolIdx: number;
    ensResolution: boolean;
}
/**

Fetches pool limit order states from a cache endpoint for a given pool on a given chain.
@param props - An object containing chainId, base currency, quote currency, pool index, and a boolean flag for ENS resolution.
@returns A Promise that resolves to an object containing pool limit order states, or undefined if the request fails.
*/
export const fetchPoolLimitOrderStates = (
    props: IFetchPoolLimitOrderStatesProps,
) => {
    const { chainId, base, quote, poolIdx, ensResolution } = props;

    const poolLimitOrderStatesCacheEndpoint =
        'https://809821320828123.de:5000' + '/pool_limit_order_states?';

    IS_LOCAL_ENV && console.debug('fetching pool recent changes');

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
        .catch(console.error);

    return poolLimitOrderStates;
};
