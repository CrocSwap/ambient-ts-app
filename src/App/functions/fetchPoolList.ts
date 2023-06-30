import { CrocEnv } from '@crocswap-libs/sdk';
import { GRAPHCACHE_SMALL_URL, IS_LOCAL_ENV } from '../../constants';
import {
    TempPoolIF,
    TempPoolServerIF,
} from '../../utils/interfaces/TempPoolIF';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { FetchContractDetailsFn } from './fetchContractDetails';
import { memoizeCacheQueryFn } from './memoizePromiseFn';

export async function fetchPoolList(
    crocEnv: CrocEnv,
    tokenUniv: TokenIF[],
    cachedTokenDetails: FetchContractDetailsFn,
): Promise<TempPoolIF[]> {
    const poolListEndpoint = GRAPHCACHE_SMALL_URL + '/pool_list?';
    const FULL_ENDPOINT =
        poolListEndpoint +
        new URLSearchParams({
            chainId: (await crocEnv.context).chain.chainId,
            poolIdx: (await crocEnv.context).chain.poolIndex.toString(),
        });
    return fetch(FULL_ENDPOINT)
        .then((response) => response.json())
        .then((json) => {
            if (!json?.data) {
                return [];
            }
            let payload = json?.data as TempPoolServerIF[];
            payload = payload.filter((p) => inTokenUniv(p, tokenUniv));
            // TODO:    this is a `Promise.allSettled()` because one bad call for
            // TODO:    ... a contract with no `symbol()` method was failing and
            // TODO:    ... taking everything down, instructions from Doug are to
            // TODO:    ... drop the bad result and investigate more later
            const pools = Promise.allSettled(
                payload.map((p) =>
                    expandPoolData(p, crocEnv, cachedTokenDetails),
                ),
            ).then((results) => {
                function getFulfilledValues<T>(
                    promises: PromiseSettledResult<T>[],
                ): T[] {
                    const fulfilledValues: T[] = [];
                    const rejectedPromises: PromiseRejectedResult[] = [];
                    for (const result of promises) {
                        result.status === 'fulfilled'
                            ? fulfilledValues.push(result.value)
                            : rejectedPromises.push(result);
                    }
                    IS_LOCAL_ENV &&
                        rejectedPromises.forEach((reject) => {
                            console.warn(
                                'failed pool metadata query, see file fetchPoolList.ts to troubleshoot',
                                reject,
                            );
                        });
                    return fulfilledValues;
                }
                return getFulfilledValues(results).filter(hasValidMetadata);
            });
            return pools;
        });
}

function inTokenUniv(payload: TempPoolServerIF, tokenUniv: TokenIF[]): boolean {
    const hasBase = tokenUniv.some(
        (t) => t.address.toLowerCase() === payload.base.toLowerCase(),
    );
    const hasQuote = tokenUniv.some(
        (t) => t.address.toLowerCase() === payload.quote.toLowerCase(),
    );
    return hasBase && hasQuote;
}

function hasValidMetadata(pool: TempPoolIF): boolean {
    return pool.baseSymbol !== '' && pool.quoteSymbol !== '';
}

async function expandPoolData(
    payload: TempPoolServerIF,
    crocEnv: CrocEnv,
    cachedTokenDetails: FetchContractDetailsFn,
): Promise<TempPoolIF> {
    const baseDetails = cachedTokenDetails(
        (await crocEnv.context).provider,
        payload.base,
        (await crocEnv.context).chain.chainId,
    );
    const quoteDetails = cachedTokenDetails(
        (await crocEnv.context).provider,
        payload.quote,
        (await crocEnv.context).chain.chainId,
    );

    return Object.assign({}, payload, {
        baseSymbol: (await baseDetails)?.symbol || '',
        quoteSymbol: (await quoteDetails)?.symbol || '',
        baseDecimals: (await baseDetails)?.decimals || 1,
        quoteDecimals: (await baseDetails)?.decimals || 1,
    });
}

export type PoolListFn = (
    chain: string,
    poolIdx: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<any>;

export function memoizeFetchPoolList(): PoolListFn {
    return memoizeCacheQueryFn(fetchPoolList) as PoolListFn;
}
