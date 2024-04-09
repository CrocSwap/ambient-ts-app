import { PublicClient } from 'viem';
import { memoizeProviderFn } from '../dataLayer/functions/memoizePromiseFn';

export async function fetchBlockTime(
    publicClient: PublicClient,
    blockNumber: number,
): Promise<number | undefined> {
    try {
        const block = publicClient.getBlock({
            blockNumber: BigInt(blockNumber),
        });
        return Number((await block).timestamp);
    } catch (error) {
        return undefined;
    }
}

export type FetchBlockTimeFn = (
    publicClient: PublicClient,
    blockNumber: number,
) => Promise<number | undefined>;

export function memoizeFetchBlockTime(): FetchBlockTimeFn {
    return memoizeProviderFn(fetchBlockTime) as FetchBlockTimeFn;
}
