import { ethers } from 'ethers';
import { memoizeProviderFn } from './memoizePromiseFn';

export const fetchEnsAddress = async (
    provider: ethers.providers.Provider,
    address: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _chainId: string,
) => {
    try {
        return provider.lookupAddress(address);
    } catch (e) {
        console.warn(e);
        return null;
    }
};

export type FetchAddrFn = (
    provider: ethers.providers.Provider,
    address: string,
    chainId: string,
) => Promise<string | undefined>;

export function memoizeFetchEnsAddress(): FetchAddrFn {
    return memoizeProviderFn(fetchEnsAddress) as FetchAddrFn;
}
