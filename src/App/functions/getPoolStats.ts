import { CrocEnv } from '@crocswap-libs/sdk';
import {
    GRAPHCACHE_SMALL_URL,
    GRAPHCACHE_URL,
    IS_LOCAL_ENV,
} from '../../constants';
import { getMainnetEquivalent } from '../../utils/data/testTokenMap';
import { TokenPriceFn } from './fetchTokenPrice';
import { memoizeCacheQueryFn } from './memoizePromiseFn';

const poolStatsFreshEndpoint = GRAPHCACHE_SMALL_URL + '/pool_stats?';

export const getLiquidityFee = async (
    base: string,
    quote: string,
    poolIdx: number,
    chainId: string,
): Promise<number | undefined> => {
    return fetch(
        poolStatsFreshEndpoint +
            new URLSearchParams({
                base: base,
                quote: quote,
                poolIdx: poolIdx.toString(),
                chainId: chainId,
            }),
    )
        .then((response) => response?.json())
        .then((json) => {
            if (!json?.data) {
                return undefined;
            }

            const payload = json.data as PoolStatsServerIF;
            return payload.feeRate;
        })
        .catch(() => {
            return undefined;
        });
};

const fetchPoolStats = async (
    chainId: string,
    base: string,
    quote: string,
    poolIdx: number,
    _cacheTimeTag: number | string,
    crocEnv: CrocEnv,
    cachedFetchTokenPrice: TokenPriceFn,
): Promise<PoolStatsIF | undefined> => {
    IS_LOCAL_ENV && console.debug('fetching fresh pool stats ');
    return fetch(
        poolStatsFreshEndpoint +
            new URLSearchParams({
                chainId: chainId,
                base: base,
                quote: quote,
                poolIdx: poolIdx.toString(),
            }),
    )
        .then((response) => response.json())
        .then((json) => {
            if (!json?.data) {
                return;
            }
            const payload = json.data as PoolStatsServerIF;

            return expandPoolStats(
                payload,
                base,
                quote,
                poolIdx,
                chainId,
                crocEnv,
                cachedFetchTokenPrice,
            );
        });
};

async function expandPoolStats(
    payload: PoolStatsServerIF,
    base: string,
    quote: string,
    poolIdx: number,
    chainId: string,
    crocEnv: CrocEnv,
    cachedFetchTokenPrice: TokenPriceFn,
): Promise<PoolStatsIF> {
    const pool = crocEnv.pool(base, quote);

    const mainnetBase = getMainnetEquivalent(base, chainId);
    const mainnetQuote = getMainnetEquivalent(quote, chainId);
    const basePricePromise = cachedFetchTokenPrice(
        mainnetBase.token,
        mainnetBase.chainId,
    );
    const quotePricePromise = cachedFetchTokenPrice(
        mainnetQuote.token,
        mainnetQuote.chainId,
    );

    const basePrice = (await basePricePromise)?.usdPrice || 0.0;
    const quotePrice = (await quotePricePromise)?.usdPrice || 0.0;

    return decoratePoolStats(
        payload,
        await pool.baseDecimals,
        await pool.quoteDecimals,
        basePrice,
        quotePrice,
    );
}

function decoratePoolStats(
    payload: PoolStatsServerIF,
    baseDecimals: number,
    quoteDecimals: number,
    basePrice: number,
    quotePrice: number,
): PoolStatsIF {
    const stats = Object.assign({}, payload) as PoolStatsIF;

    stats.baseTvlDecimal = payload.baseTvl / Math.pow(10, baseDecimals);
    stats.quoteTvlDecimal = payload.quoteTvl / Math.pow(10, quoteDecimals);
    stats.baseVolumeDecimal = payload.baseVolume / Math.pow(10, baseDecimals);
    stats.quoteVolumeDecimal =
        payload.quoteVolume / Math.pow(10, quoteDecimals);
    stats.baseFeeDecimal = payload.baseFee / Math.pow(10, baseDecimals);
    stats.quoteFeeDecimal = payload.quoteFee / Math.pow(10, quoteDecimals);

    stats.baseTvlUsd = stats.baseTvlDecimal * basePrice;
    stats.quoteTvlUsd = stats.quoteTvlDecimal * quotePrice;
    stats.baseVolumeUsd = stats.baseVolumeDecimal * basePrice;
    stats.quoteVolumeUsd = stats.quoteVolumeDecimal * quotePrice;
    stats.baseFeeUsd = stats.baseFeeDecimal * basePrice;
    stats.quoteFeeUsd = stats.quoteFeeDecimal * quotePrice;

    stats.tvlTotalUsd = stats.baseTvlUsd + stats.quoteTvlUsd;
    stats.volumeTotalUsd = (stats.baseVolumeUsd + stats.quoteVolumeUsd) / 2.0;
    stats.feeTotalUsd = stats.baseFeeUsd + stats.quoteFeeUsd;

    return stats;
}

interface PoolStatsServerIF {
    latestTime: number;
    baseTvl: number;
    quoteTvl: number;
    baseVolume: number;
    quoteVolume: number;
    baseFee: number;
    quoteFee: number;
    lastPriceIndic: number;
    feeRate: number;
}

type PoolStatsIF = PoolStatsServerIF & {
    base: string;
    quote: string;
    poolIdx: number;
    baseTvlDecimal: number;
    quoteTvlDecimal: number;
    baseVolumeDecimal: number;
    quoteVolumeDecimal: number;
    baseFeeDecimal: number;
    quoteFeeDecimal: number;
    baseTvlUsd: number;
    quoteTvlUsd: number;
    baseVolumeUsd: number;
    quoteVolumeUsd: number;
    baseFeeUsd: number;
    quoteFeeUsd: number;
    tvlTotalUsd: number;
    volumeTotalUsd: number;
    feeTotalUsd: number;
};

const poolPriceChangeCacheEndpoint = GRAPHCACHE_URL + '/pool_price_change?';

const getPoolPriceChange = async (
    chainId: string,
    baseToken: string,
    quoteToken: string,
    poolIdx: number,
) => {
    return fetch(
        poolPriceChangeCacheEndpoint +
            new URLSearchParams({
                chainId: chainId,
                base: baseToken,
                quote: quoteToken,
                poolIdx: poolIdx.toString(),
                concise: 'true',
            }),
    )
        .then((response) => response.json())
        .then((json) => {
            return json.data;
        });
};

const get24hChange = async (
    chainId: string,
    baseToken: string,
    quoteToken: string,
    poolIdx: number,
    denomInBase: boolean,
): Promise<number> => {
    if (baseToken && quoteToken && poolIdx) {
        const changePercentage = fetch(
            poolPriceChangeCacheEndpoint +
                new URLSearchParams({
                    chainId: chainId,
                    base: baseToken,
                    quote: quoteToken,
                    poolIdx: poolIdx.toString(),
                    concise: 'true',
                }),
        )
            .then((response) => response.json())
            .then((json) => {
                if (denomInBase) return json?.data?.changeQuoteOverBase;
                return json?.data?.changeBaseOverQuote;
            });
        return changePercentage;
    } else {
        return 0;
    }
};

export { get24hChange, getPoolPriceChange };

export type PoolStatsFn = (
    chain: string,
    baseToken: string,
    quoteToken: string,
    poolIdx: number,
    _cacheTimeTag: number | string,
    crocEnv: CrocEnv,
    cachedFetchTokenPrice: TokenPriceFn,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<PoolStatsIF>;

export function memoizePoolStats(): PoolStatsFn {
    return memoizeCacheQueryFn(fetchPoolStats) as PoolStatsFn;
}
