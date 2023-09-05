import { ethers } from 'ethers';
import { memoizeProviderFn } from './memoizePromiseFn';

export async function fetchBlockTime(
    provider: ethers.providers.Provider,
    blockNumber: number,
): Promise<number | undefined> {
    try {
        const block = provider.getBlock(blockNumber);
        return (await block).timestamp;
    } catch (error) {
        return undefined;
    }
}

export type FetchBlockTimeFn = (
    provider: ethers.providers.Provider,
    blockNumber: number,
) => Promise<number | undefined>;

export function memoizeFetchBlockTime(): FetchBlockTimeFn {
    return memoizeProviderFn(fetchBlockTime) as FetchBlockTimeFn;
}
