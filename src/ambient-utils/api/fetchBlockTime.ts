import { ethers } from 'ethers';
import { memoizeProviderFn } from '../dataLayer/functions/memoizePromiseFn';

export async function fetchBlockTime(
    provider: ethers.Provider,
    blockNumber: number,
): Promise<number | undefined> {
    try {
        const block = provider.getBlock(blockNumber);
        return Number((await block)?.timestamp);
    } catch (error) {
        return undefined;
    }
}

export type FetchBlockTimeFn = (
    provider: ethers.Provider,
    blockNumber: number,
) => Promise<number | undefined>;

export function memoizeFetchBlockTime(): FetchBlockTimeFn {
    return memoizeProviderFn(fetchBlockTime) as FetchBlockTimeFn;
}
