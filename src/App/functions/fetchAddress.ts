/* eslint-disable camelcase */
import { ethers } from 'ethers';
import {
    ANALYTICS_URL,
    USE_NODE_PROVIDER_FOR_ENS_LOOKUP,
} from '../../constants';
import { memoizePromiseFn } from './memoizePromiseFn';

export const fetchEnsAddress = async (
    address: string,
    provider?: ethers.providers.Provider,
) => {
    if (provider && USE_NODE_PROVIDER_FOR_ENS_LOOKUP) {
        try {
            return provider.lookupAddress(address);
        } catch (e) {
            console.warn(e);
            return null;
        }
    } else {
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
    }
};

export type FetchAddrFn = (
    address: string,
    provider?: ethers.providers.Provider,
) => Promise<string | undefined>;

export function memoizeFetchEnsAddress(): FetchAddrFn {
    return memoizePromiseFn(fetchEnsAddress) as FetchAddrFn;
}
