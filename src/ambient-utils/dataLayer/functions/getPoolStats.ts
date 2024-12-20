import { CrocEnv, bigIntToFloat, toDisplayPrice } from '@crocswap-libs/sdk';
import { isETHorStakedEthToken } from '..';
import { FetchContractDetailsFn, TokenPriceFn } from '../../api';
import {
    ZERO_ADDRESS,
    ethereumMainnet,
    excludedTokenAddressesLowercase,
    mainnetETH,
} from '../../constants';
import { SinglePoolDataIF, TokenIF } from '../../types';
import { memoizeCacheQueryFn } from './memoizePromiseFn';

const getLiquidityFee = async (
    base: string,
    quote: string,
    poolIdx: number,
    chainId: string,
    GCGO_URL: string,
    _cacheTimeTag: number | string,
): Promise<number | undefined> => {
    const poolStatsFreshEndpoint = GCGO_URL + '/pool_stats?';
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
    GCGO_URL: string,
    histTime?: number,
): Promise<PoolStatsServerIF | undefined> => {
    const poolStatsFreshEndpoint = GCGO_URL + '/pool_stats?';

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

const fetchAllPoolStats = async (
    chainId: string,
    GCGO_URL: string,
    _cacheTimeTag: number | string,
    with24hPrices?: boolean,
): Promise<PoolStatsServerIF | undefined> => {
    const allPoolStatsEndpoint = GCGO_URL + '/all_pool_stats?';

    if (with24hPrices) {
        return fetch(
            allPoolStatsEndpoint +
                new URLSearchParams({
                    chainId: chainId,
                    with24hPrices: 'true',
                }),
        )
            .then((response) => response.json())
            .then((json) => {
                if (!json?.data) {
                    return;
                }
                const payload = json.data as PoolStatsServerIF;
                return payload;
            });
    } else {
        return fetch(
            allPoolStatsEndpoint +
                new URLSearchParams({
                    chainId: chainId,
                }),
        )
            .then((response) => response.json())
            .then((json) => {
                if (!json?.data) {
                    return;
                }
                const payload = json.data as PoolStatsServerIF;
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
    tokenList: TokenIF[],
    enableTotalSupply?: boolean,
): Promise<PoolStatsIF> {
    const provider = (await crocEnv.context).provider;

    const basePricePromise = cachedFetchTokenPrice(base, chainId);
    const quotePricePromise = cachedFetchTokenPrice(quote, chainId);

    const baseUsdPrice = (await basePricePromise)?.usdPrice;
    const quoteUsdPrice = (await quotePricePromise)?.usdPrice;

    const baseTokenListed = tokenList.find(
        (token) => token.address.toLowerCase() === base.toLowerCase(),
    );
    const quoteTokenListed = tokenList.find(
        (token) => token.address.toLowerCase() === quote.toLowerCase(),
    );

    const baseTokenListedDecimals = baseTokenListed?.decimals;
    const quoteTokenListedDecimals = quoteTokenListed?.decimals;

    const baseTokenListedTotalSupply = baseTokenListed?.totalSupply;
    const quoteTokenListedTotalSupply = quoteTokenListed?.totalSupply;

    const DEFAULT_DECIMALS = 18;

    const baseDecimals =
        (baseTokenListedDecimals ||
            (await cachedTokenDetails(provider, base, chainId))?.decimals) ??
        DEFAULT_DECIMALS;

    const quoteDecimals =
        (quoteTokenListedDecimals ||
            (await cachedTokenDetails(provider, quote, chainId))?.decimals) ??
        DEFAULT_DECIMALS;

    const baseTotalSupplyBigInt =
        !enableTotalSupply || base === ZERO_ADDRESS
            ? undefined
            : baseTokenListedTotalSupply ||
              (await cachedTokenDetails(provider, base, chainId))?.totalSupply;

    const quoteTotalSupplyBigInt = !enableTotalSupply
        ? undefined
        : quoteTokenListedTotalSupply ||
          (await cachedTokenDetails(provider, quote, chainId))?.totalSupply;

    const baseTotalSupplyNum = baseTotalSupplyBigInt
        ? bigIntToFloat(baseTotalSupplyBigInt)
        : undefined;

    const quoteTotalSupplyNum = quoteTotalSupplyBigInt
        ? bigIntToFloat(quoteTotalSupplyBigInt)
        : undefined;

    const getEthPrice = async () => {
        const mainnetEthPrice = await cachedFetchTokenPrice(
            mainnetETH.address,
            ethereumMainnet.chainId,
        );
        return mainnetEthPrice?.usdPrice;
    };

    const lastPriceSwap = payload.lastPriceSwap;

    const displayPoolPrice = toDisplayPrice(
        lastPriceSwap,
        baseDecimals,
        quoteDecimals,
    );

    const basePrice = baseUsdPrice
        ? baseUsdPrice
        : isETHorStakedEthToken(base)
          ? (await getEthPrice()) || 0.0
          : quoteUsdPrice
            ? quoteUsdPrice / displayPoolPrice
            : 0.0;

    const quotePrice = quoteUsdPrice
        ? quoteUsdPrice
        : isETHorStakedEthToken(quote)
          ? (await getEthPrice()) || 0.0
          : baseUsdPrice
            ? baseUsdPrice * displayPoolPrice
            : 0.0;

    return decoratePoolStats(
        payload,
        baseDecimals,
        quoteDecimals,
        baseTotalSupplyNum,
        quoteTotalSupplyNum,
        basePrice,
        quotePrice,
    );
}

function decoratePoolStats(
    payload: PoolStatsServerIF,
    baseDecimals: number,
    quoteDecimals: number,
    baseTotalSupplyNum: number | undefined,
    quoteTotalSupplyNum: number | undefined,
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

    stats.baseFdvUsd = baseTotalSupplyNum
        ? (baseTotalSupplyNum / Math.pow(10, baseDecimals)) * basePrice
        : undefined;
    stats.quoteFdvUsd = quoteTotalSupplyNum
        ? (quoteTotalSupplyNum / Math.pow(10, quoteDecimals)) * quotePrice
        : undefined;

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
    lastPriceSwap: number;
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
    baseFdvUsd?: number;
    quoteFdvUsd?: number;
};

const get24hChange = async (
    chainId: string,
    baseToken: string,
    quoteToken: string,
    poolIdx: number,
    denomInBase: boolean,
    GCGO_URL: string,
    _cacheTimeTag: number | string,
): Promise<number | undefined> => {
    const poolStatsFreshEndpoint = GCGO_URL + '/pool_stats?';

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
            return payload.lastPriceSwap;
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
            return payload.lastPriceSwap;
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
    GCGO_URL: string,
    cachedFetchTokenPrice: TokenPriceFn,
    tokenCount: number,
    allDefaultTokens?: TokenIF[],
): Promise<DexAggStatsIF | undefined>;

// fn signature to return chain stats as individual data points
export async function getChainStats(
    returnAs: 'expanded',
    chainId: string,
    crocEnv: CrocEnv,
    GCGO_URL: string,
    cachedFetchTokenPrice: TokenPriceFn,
    tokenCount: number,
    allDefaultTokens?: TokenIF[],
): Promise<DexTokenAggServerIF[] | undefined>;

// overloaded fn to return chain stats in expanded or cumulative form
export async function getChainStats(
    returnAs: 'cumulative' | 'expanded',
    chainId: string,
    crocEnv: CrocEnv,
    GCGO_URL: string,
    cachedFetchTokenPrice: TokenPriceFn,
    tokenCount: number,
    allDefaultTokens?: TokenIF[],
): Promise<DexAggStatsIF | DexTokenAggServerIF[] | undefined> {
    const chainStatsFreshEndpoint = GCGO_URL + '/chain_stats?';

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

            // Filter out excluded addresses
            const filteredData = json.data.filter(
                (item: { tokenAddr: string }) =>
                    !excludedTokenAddressesLowercase.includes(
                        item.tokenAddr.toLowerCase(),
                    ),
            );

            if (returnAs === 'expanded') {
                return filteredData;
            } else if (returnAs === 'cumulative') {
                const payload = filteredData as DexTokenAggServerIF[];
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
    const usdPrice = cachedFetchTokenPrice(stats.tokenAddr, chainId).then(
        (p) => p?.usdPrice || 0.0,
    );

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
    GCGO_URL: string,
    histTime?: number,
) => Promise<PoolStatsServerIF>;

export type AllPoolStatsFn = (
    chain: string,
    GCGO_URL: string,
    _cacheTimeTag: number | string,
    with24hPrices?: boolean,
) => Promise<SinglePoolDataIF[]>;

export type Change24Fn = (
    chainId: string,
    baseToken: string,
    quoteToken: string,
    poolIdx: number,
    denomInBase: boolean,
    GCGO_URL: string,
    _cacheTimeTag: number | string,
) => Promise<number | undefined>;

export type LiquidityFeeFn = (
    base: string,
    quote: string,
    poolIdx: number,
    chainId: string,
    GCGO_URL: string,
    _cacheTimeTag: number | string,
) => Promise<number | undefined>;

export function memoizePoolStats(): PoolStatsFn {
    return memoizeCacheQueryFn(fetchPoolStats) as PoolStatsFn;
}

export function memoizeAllPoolStats(): AllPoolStatsFn {
    return memoizeCacheQueryFn(fetchAllPoolStats) as AllPoolStatsFn;
}

export function memoizeGet24hChange(): Change24Fn {
    return memoizeCacheQueryFn(get24hChange) as Change24Fn;
}

export function memoizeGetLiquidityFee(): LiquidityFeeFn {
    return memoizeCacheQueryFn(getLiquidityFee) as LiquidityFeeFn;
}
