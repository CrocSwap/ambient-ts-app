import { CrocEnv } from '@crocswap-libs/sdk';
import { GRAPHCACHE_SMALL_URL } from '../../constants';
import {
    TempPoolIF,
    TempPoolServerIF,
} from '../../utils/interfaces/TempPoolIF';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { FetchContractDetailsFn } from './fetchContractDetails';
import { memoizeCacheQueryFn } from './memoizePromiseFn';

const poolListEndpoint = GRAPHCACHE_SMALL_URL + '/pool_list?';

export async function fetchPoolList(
    crocEnv: CrocEnv,
    tokenUniv: TokenIF[],
    cachedTokenDetails: FetchContractDetailsFn,
): Promise<TempPoolIF[]> {
    return fetch(
        poolListEndpoint +
            new URLSearchParams({
                chainId: (await crocEnv.context).chain.chainId,
                poolIdx: (await crocEnv.context).chain.poolIndex.toString(),
            }),
    )
        .then((response) => response.json())
        .then((json) => {
            if (!json?.data) {
                return [] as TempPoolIF[];
            }
            let payload = json?.data as TempPoolServerIF[];

            payload = payload.filter((p) => inTokenUniv(p, tokenUniv));

            const pools = Promise.all(
                payload.map((p) =>
                    expandPoolData(p, crocEnv, cachedTokenDetails),
                ),
            );
            return pools.then((p) => p.filter(hasValidMetadata));
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
