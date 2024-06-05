/* eslint-disable camelcase */
import {
    PAIR_LOOKUP_URL,
    WRAPPED_NATIVE_TOKENS,
    ZERO_ADDRESS,
} from '../constants';
import { memoizePromiseFn } from '../dataLayer/functions/memoizePromiseFn';

export const fetchTopPairedToken = async (address: string, chainId: string) => {
    const isWrappedNativeToken = WRAPPED_NATIVE_TOKENS.includes(
        address.toLowerCase(),
    );
    try {
        const response = await fetch(
            PAIR_LOOKUP_URL +
                new URLSearchParams({
                    chain: chainId,
                    token: isWrappedNativeToken ? ZERO_ADDRESS : address,
                }),
        );
        const result = await response.json();
        return result?.target;
    } catch (e) {
        console.warn(e);
        return null;
    }
};

export type FetchTopPairedTokenFn = (
    address: string,
    chainId: string,
) => Promise<string | undefined>;

export function memoizeFetchTopPairedToken(): FetchTopPairedTokenFn {
    return memoizePromiseFn(fetchTopPairedToken) as FetchTopPairedTokenFn;
}
