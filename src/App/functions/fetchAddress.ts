import { ethers } from 'ethers';
import { memoizeProviderFn } from './memoizePromiseFn';

export const fetchAddress = async (
    provider: ethers.providers.Provider,
    address: string,
    _chainId: string,
) => {
    return provider.lookupAddress(address);
};

type FetchAddrFn = (
    provider: ethers.providers.Provider,
    address: string,
    chainId: string,
) => Promise<string | undefined>;

export function memoizeFetchAddress(): FetchAddrFn {
    return memoizeProviderFn(fetchAddress) as FetchAddrFn;
}
