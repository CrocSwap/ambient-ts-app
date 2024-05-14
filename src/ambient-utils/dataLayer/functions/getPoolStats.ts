import { CrocEnv, toDisplayPrice } from '@crocswap-libs/sdk';
import { CACHE_UPDATE_FREQ_IN_MS, GCGO_OVERRIDE_URL } from '../../constants';
import { FetchContractDetailsFn, TokenPriceFn } from '../../api';
import { memoizeCacheQueryFn } from './memoizePromiseFn';
import { TokenIF } from '../../types';
import { PoolQueryFn } from './querySpotPrice';

const getLiquidityFee = async (
    base: string,
    quote: string,
    poolIdx: number,
    chainId: string,
    graphCacheUrl: string,
    _cacheTimeTag: number | string,
): Promise<number | undefined> => {
    const poolStatsFreshEndpoint = GCGO_OVERRIDE_URL
        ? GCGO_OVERRIDE_URL + '/pool_stats?'
        : graphCacheUrl + '/pool_stats?';
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
    graphCacheUrl: string,
    histTime?: number,
): Promise<PoolStatsServerIF | undefined> => {
    const poolStatsFreshEndpoint = GCGO_OVERRIDE_URL
        ? GCGO_OVERRIDE_URL + '/pool_stats?'
        : graphCacheUrl + '/pool_stats?';

    if (histTime) {
        return fetch(
            poolStatsFreshEndpoint +
                new URLSearchParams({
                    chainId: chainId,
                    base: base,
                    quote: quote,
                    poolIdx: poolIdx.toString(),
                    histTime: histTime.toString(),
                }),
        )
            .then((response) => response.json())
            .then((json) => {
                if (!json?.data) {
                    return;
                }
                const payload = json.data as PoolStatsServerIF;
                payload.isHistorical = true;
                return payload;
            });
    } else {
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
                payload.isHistorical = false;
                return payload;
            });
    }
};

export async function expandPoolStats(
    payload: PoolStatsServerIF,
    base: string,
    quote: string,
    chainId: string,
    crocEnv: CrocEnv,
    cachedFetchTokenPrice: TokenPriceFn,
    cachedTokenDetails: FetchContractDetailsFn,
    cachedQuerySpotPrice: PoolQueryFn,
    tokenList: TokenIF[],
): Promise<PoolStatsIF> {
    const provider = (await crocEnv.context).provider;

    const basePricePromise = cachedFetchTokenPrice(base, chainId, crocEnv);
    const quotePricePromise = cachedFetchTokenPrice(quote, chainId, crocEnv);

    const baseUsdPrice = (await basePricePromise)?.usdPrice;
    const quoteUsdPrice = (await quotePricePromise)?.usdPrice;

    const baseTokenListedDecimals = tokenList.find(
        (token) => token.address.toLowerCase() === base.toLowerCase(),
    )?.decimals;
    const quoteTokenListedDecimals = tokenList.find(
        (token) => token.address.toLowerCase() === quote.toLowerCase(),
    )?.decimals;

    const DEFAULT_DECIMALS = 18;

    const baseDecimals =
        (baseTokenListedDecimals ||
            (await cachedTokenDetails(provider, base, chainId))?.decimals) ??
        DEFAULT_DECIMALS;

    const quoteDecimals =
        (quoteTokenListedDecimals ||
            (await cachedTokenDetails(provider, quote, chainId))?.decimals) ??
        DEFAULT_DECIMALS;

    const getSpotPrice = async () => {
        const spotPrice = await cachedQuerySpotPrice(
            crocEnv,
            base,
            quote,
            chainId,
            Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS),
        );
        const displayPoolPrice = toDisplayPrice(
            spotPrice,
            baseDecimals,
            quoteDecimals,
        );
        return displayPoolPrice;
    };

    const basePrice = baseUsdPrice
        ? baseUsdPrice
        : quoteUsdPrice
        ? quoteUsdPrice / (await getSpotPrice())
        : 0.0;
    const quotePrice = quoteUsdPrice
        ? quoteUsdPrice
        : baseUsdPrice
        ? baseUsdPrice * (await getSpotPrice())
        : 0.0;

    return decoratePoolStats(
        payload,
        baseDecimals,
        quoteDecimals,
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
    stats.baseFeeDecimal = payload.baseFees / Math.pow(10, baseDecimals);
    stats.quoteFeeDecimal = payload.quoteFees / Math.pow(10, quoteDecimals);

    stats.baseTvlUsd = stats.baseTvlDecimal * basePrice;
    stats.quoteTvlUsd = stats.quoteTvlDecimal * quotePrice;
    stats.baseVolumeUsd = stats.baseVolumeDecimal * basePrice;
    stats.quoteVolumeUsd = stats.quoteVolumeDecimal * quotePrice;
    stats.baseFeeUsd = stats.baseFeeDecimal * basePrice;
    stats.quoteFeeUsd = stats.quoteFeeDecimal * quotePrice;

    stats.tvlTotalUsd = stats.baseTvlUsd + stats.quoteTvlUsd;
    stats.volumeTotalUsd = (stats.baseVolumeUsd + stats.quoteVolumeUsd) / 2.0;
    stats.feesTotalUsd = stats.baseFeeUsd + stats.quoteFeeUsd;

    return stats;
}

interface PoolStatsServerIF {
    latestTime: number;
    baseTvl: number;
    quoteTvl: number;
    baseVolume: number;
    quoteVolume: number;
    baseFees: number;
    quoteFees: number;
    lastPriceIndic: number;
    feeRate: number;
    isHistorical: boolean;
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
    feesTotalUsd: number;
};

const get24hChange = async (
    chainId: string,
    baseToken: string,
    quoteToken: string,
    poolIdx: number,
    denomInBase: boolean,
    graphCacheUrl: string,
    _cacheTimeTag: number | string,
): Promise<number | undefined> => {
    const poolStatsFreshEndpoint = GCGO_OVERRIDE_URL
        ? GCGO_OVERRIDE_URL + '/pool_stats?'
        : graphCacheUrl + '/pool_stats?';

    const nowQuery = fetch(
        poolStatsFreshEndpoint +
            new URLSearchParams({
                chainId: chainId,
                base: baseToken,
                quote: quoteToken,
                poolIdx: poolIdx.toString(),
            }),
    )
        .then((response) => response.json())
        .then((json) => {
            if (!json?.data) {
                return;
            }
            const payload = json.data as PoolStatsServerIF;
            return payload.lastPriceIndic;
        });

    const ydayTime = Math.floor(Date.now() / 1000 - 24 * 3600);
    const ydayQuery = fetch(
        poolStatsFreshEndpoint +
            new URLSearchParams({
                chainId: chainId,
                base: baseToken,
                quote: quoteToken,
                poolIdx: poolIdx.toString(),
                histTime: ydayTime.toString(),
            }),
    )
        .then((response) => response.json())
        .then((json) => {
            if (!json?.data) {
                return;
            }
            const payload = json.data as PoolStatsServerIF;
            return payload.lastPriceIndic;
        });

    const ydayPrice = await ydayQuery;
    const nowPrice = await nowQuery;

    if (ydayPrice && nowPrice && ydayPrice > 0 && nowPrice > 0) {
        return denomInBase
            ? ydayPrice / nowPrice - 1.0
            : nowPrice / ydayPrice - 1.0;
    } else {
        return 0.0;
    }
};

interface DexAggStatsIF {
    tvlTotalUsd: number;
    volumeTotalUsd: number;
    feesTotalUsd: number;
}

export interface DexTokenAggServerIF {
    tokenAddr: string;
    dexVolume: number;
    dexTvl: number;
    dexFees: number;
    latestTime: number;
}

// fn signature to return chain stats in cumulative form
export async function getChainStats(
    returnAs: 'cumulative',
    chainId: string,
    crocEnv: CrocEnv,
    graphCacheUrl: string,
    cachedFetchTokenPrice: TokenPriceFn,
    tokenCount: number,
    allDefaultTokens?: TokenIF[],
): Promise<DexAggStatsIF | undefined>;

// fn signature to return chain stats as individual data points
export async function getChainStats(
    returnAs: 'expanded',
    chainId: string,
    crocEnv: CrocEnv,
    graphCacheUrl: string,
    cachedFetchTokenPrice: TokenPriceFn,
    tokenCount: number,
    allDefaultTokens?: TokenIF[],
): Promise<DexTokenAggServerIF[] | undefined>;

// overloaded fn to return chain stats in expanded or cumulative form
export async function getChainStats(
    returnAs: 'cumulative' | 'expanded',
    chainId: string,
    crocEnv: CrocEnv,
    graphCacheUrl: string,
    cachedFetchTokenPrice: TokenPriceFn,
    tokenCount: number,
    allDefaultTokens?: TokenIF[],
): Promise<DexAggStatsIF | DexTokenAggServerIF[] | undefined> {
    const chainStatsFreshEndpoint = GCGO_OVERRIDE_URL
        ? GCGO_OVERRIDE_URL + '/chain_stats?'
        : graphCacheUrl + '/chain_stats?';
    return fetch(
        chainStatsFreshEndpoint +
            new URLSearchParams({
                chainId: chainId,
                n: tokenCount.toString(),
            }),
    )
        .then((response) => response?.json())
        .then((json) => {
            if (!json?.data) {
                return undefined;
            }
            if (returnAs === 'expanded') {
                return json.data;
            } else if (returnAs === 'cumulative') {
                const payload = json.data as DexTokenAggServerIF[];
                return expandChainStats(
                    payload,
                    chainId,
                    crocEnv,
                    cachedFetchTokenPrice,
                    allDefaultTokens,
                );
            }
        })
        .catch((e) => {
            console.warn(e);
            return undefined;
        });
}

async function expandChainStats(
    tokenStats: DexTokenAggServerIF[],
    chainId: string,
    crocEnv: CrocEnv,
    cachedFetchTokenPrice: TokenPriceFn,
    allDefaultTokens?: TokenIF[],
): Promise<DexAggStatsIF> {
    const subAggs = await Promise.all(
        tokenStats.map((t) =>
            expandTokenStats(
                t,
                chainId,
                crocEnv,
                cachedFetchTokenPrice,
                allDefaultTokens,
            ),
        ),
    );

    const accum = {
        tvlTotalUsd: 0.0,
        volumeTotalUsd: 0.0,
        feesTotalUsd: 0.0,
    };

    subAggs.forEach((s) => {
        accum.tvlTotalUsd += s.tvlTotalUsd;
        accum.feesTotalUsd += s.feesTotalUsd;
        /* Because each trade has two sides and we're summing each token's
         * volume divide by two. This may undercount volume from long tail pairs,
         * because we're only 10 most recent tokens. */
        accum.volumeTotalUsd += s.volumeTotalUsd / 2.0;
    });
    return accum;
}

async function expandTokenStats(
    stats: DexTokenAggServerIF,
    chainId: string,
    crocEnv: CrocEnv,
    cachedFetchTokenPrice: TokenPriceFn,
    allDefaultTokens?: TokenIF[],
): Promise<DexAggStatsIF> {
    // check if tokenUniv includes the token's decimals value
    const token = allDefaultTokens?.find(
        (t) => t.address.toLowerCase() === stats.tokenAddr.toLowerCase(),
    );
    const decimals = token?.decimals || crocEnv.token(stats.tokenAddr).decimals;
    const usdPrice = cachedFetchTokenPrice(
        stats.tokenAddr,
        chainId,
        crocEnv,
    ).then((p) => p?.usdPrice || 0.0);

    const mult = (await usdPrice) / Math.pow(10, await decimals);
    return {
        tvlTotalUsd: stats.dexTvl * mult,
        volumeTotalUsd: stats.dexVolume * mult,
        feesTotalUsd: stats.dexFees * mult,
    };
}

export type PoolStatsFn = (
    chain: string,
    baseToken: string,
    quoteToken: string,
    poolIdx: number,
    _cacheTimeTag: number | string,
    graphCacheUrl: string,
    histTime?: number,
) => Promise<PoolStatsServerIF>;

export type Change24Fn = (
    chainId: string,
    baseToken: string,
    quoteToken: string,
    poolIdx: number,
    denomInBase: boolean,
    graphCacheUrl: string,
    _cacheTimeTag: number | string,
) => Promise<number | undefined>;

export type LiquidityFeeFn = (
    base: string,
    quote: string,
    poolIdx: number,
    chainId: string,
    graphCacheUrl: string,
    _cacheTimeTag: number | string,
) => Promise<number | undefined>;

export function memoizePoolStats(): PoolStatsFn {
    return memoizeCacheQueryFn(fetchPoolStats) as PoolStatsFn;
}

export function memoizeGet24hChange(): Change24Fn {
    return memoizeCacheQueryFn(get24hChange) as Change24Fn;
}

export function memoizeGetLiquidityFee(): LiquidityFeeFn {
    return memoizeCacheQueryFn(getLiquidityFee) as LiquidityFeeFn;
}
