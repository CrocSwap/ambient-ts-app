/* eslint-disable camelcase */
import { ANALYTICS_URL } from '../../constants';
import { memoizePromiseFn } from './memoizePromiseFn';

export const fetchEnsAddress = async (address: string) => {
    try {
        const response = await fetch(
            ANALYTICS_URL +
                new URLSearchParams({
                    service: 'run',
                    config_path: 'ens_address',
                    include_data: '0',
                    address,
                }),
        );
        const result = await response.json();
        return result?.ens_address;
    } catch (e) {
        console.warn(e);
        return null;
    }
};

export type FetchAddrFn = (address: string) => Promise<string | undefined>;

export function memoizeFetchEnsAddress(): FetchAddrFn {
    return memoizePromiseFn(fetchEnsAddress) as FetchAddrFn;
}
