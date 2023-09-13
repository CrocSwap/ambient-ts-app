/* eslint-disable camelcase */
import { ethers } from 'ethers';
import { ANALYTICS_URL } from '../../constants';
import { memoizeProviderFn } from './memoizePromiseFn';

export const fetchEnsAddress = async (
    _: ethers.providers.Provider,
    address: string,
) => {
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

export type FetchAddrFn = (
    provider: ethers.providers.Provider,
    address: string,
) => Promise<string | undefined>;

export function memoizeFetchEnsAddress(): FetchAddrFn {
    return memoizeProviderFn(fetchEnsAddress) as FetchAddrFn;
}
