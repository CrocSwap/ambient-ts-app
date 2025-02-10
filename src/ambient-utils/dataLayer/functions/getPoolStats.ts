import { CrocEnv, bigIntToFloat, toDisplayPrice } from '@crocswap-libs/sdk';
import {
    getFormattedNumber,
    getMoneynessRank,
    isETHorStakedEthToken,
} from '..';
import { FetchContractDetailsFn, TokenPriceFn } from '../../api';
import {
    ZERO_ADDRESS,
    ethereumMainnet,
    excludedTokenAddressesLowercase,
} from '../../constants';
import { MAINNET_TOKENS } from '../../constants/networks/ethereumMainnet';
import { PoolIF, SinglePoolDataIF, TokenIF } from '../../types';
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
    pool: PoolIF,
    crocEnv: CrocEnv,
    cachedFetchTokenPrice: TokenPriceFn,
    cachedTokenDetails: FetchContractDetailsFn,
    tokenList: TokenIF[],
    enableTotalSupply?: boolean,
): Promise<PoolIF> {
    const provider = (await crocEnv.context).provider;

    const baseUsdPrice = pool.baseUsdPrice || 0;
    const quoteUsdPrice = pool.quoteUsdPrice || 0;

    const baseTokenListed = tokenList.find(
        (token) =>
            token.address.toLowerCase() === pool.base.address.toLowerCase(),
    );
    const quoteTokenListed = tokenList.find(
        (token) =>
            token.address.toLowerCase() === pool.quote.address.toLowerCase(),
    );

    const baseTokenListedDecimals = baseTokenListed?.decimals;
    const quoteTokenListedDecimals = quoteTokenListed?.decimals;

    const baseTokenListedTotalSupply = baseTokenListed?.totalSupply;
    const quoteTokenListedTotalSupply = quoteTokenListed?.totalSupply;

    const DEFAULT_DECIMALS = 18;

    const baseDecimals =
        (baseTokenListedDecimals ||
            (
                await cachedTokenDetails(
                    provider,
                    pool.base.address,
                    pool.chainId,
                )
            )?.decimals) ??
        DEFAULT_DECIMALS;

    const quoteDecimals =
        (quoteTokenListedDecimals ||
            (
                await cachedTokenDetails(
                    provider,
                    pool.quote.address,
                    pool.chainId,
                )
            )?.decimals) ??
        DEFAULT_DECIMALS;

    const baseTotalSupplyBigInt =
        !enableTotalSupply || pool.base.address === ZERO_ADDRESS
            ? undefined
            : baseTokenListedTotalSupply ||
              (
                  await cachedTokenDetails(
                      provider,
                      pool.base.address,
                      pool.chainId,
                  )
              )?.totalSupply;

    const quoteTotalSupplyBigInt = !enableTotalSupply
        ? undefined
        : quoteTokenListedTotalSupply ||
          (await cachedTokenDetails(provider, pool.quote.address, pool.chainId))
              ?.totalSupply;

    const baseTotalSupplyNum = baseTotalSupplyBigInt
        ? bigIntToFloat(baseTotalSupplyBigInt)
        : undefined;

    const quoteTotalSupplyNum = quoteTotalSupplyBigInt
        ? bigIntToFloat(quoteTotalSupplyBigInt)
        : undefined;

    const getEthPrice = async () => {
        const mainnetEthPrice = await cachedFetchTokenPrice(
            MAINNET_TOKENS.ETH.address,
            ethereumMainnet.chainId,
        );
        return mainnetEthPrice?.usdPrice;
    };

    const lastPriceSwap = pool.lastPriceSwap || 0;

    const displayPoolPrice = toDisplayPrice(
        lastPriceSwap,
        baseDecimals,
        quoteDecimals,
    );

    const basePrice = baseUsdPrice
        ? baseUsdPrice
        : isETHorStakedEthToken(pool.base.address)
          ? (await getEthPrice()) || 0.0
          : quoteUsdPrice && displayPoolPrice
            ? quoteUsdPrice / displayPoolPrice
            : 0.0;

    const quotePrice = quoteUsdPrice
        ? quoteUsdPrice
        : isETHorStakedEthToken(pool.quote.address)
          ? (await getEthPrice()) || 0.0
          : baseUsdPrice
            ? baseUsdPrice * displayPoolPrice
            : 0.0;

    return decoratePoolStats(
        pool,
        baseDecimals,
        quoteDecimals,
        baseTotalSupplyNum,
        quoteTotalSupplyNum,
        basePrice,
        quotePrice,
    );
}

function decoratePoolStats(
    pool: PoolIF,
    baseDecimals: number,
    quoteDecimals: number,
    baseTotalSupplyNum: number | undefined,
    quoteTotalSupplyNum: number | undefined,
    basePrice: number,
    quotePrice: number,
): PoolIF {
    const stats = Object.assign({}, pool) as PoolIF;
    stats.baseTvlDecimal = (pool.baseTvl || 0) / Math.pow(10, baseDecimals);
    stats.quoteTvlDecimal = (pool.quoteTvl || 0) / Math.pow(10, quoteDecimals);
    stats.baseVolumeDecimal =
        (pool.baseVolume || 0) / Math.pow(10, baseDecimals);
    const baseVolumeDecimal24hAgo =
        (pool.baseVolume24hAgo || 0) / Math.pow(10, baseDecimals);
    stats.quoteVolumeDecimal =
        (pool.quoteVolume || 0) / Math.pow(10, quoteDecimals);
    const quoteVolumeDecimal24hAgo =
        (pool.quoteVolume24hAgo || 0) / Math.pow(10, quoteDecimals);
    stats.baseFeeDecimal = (pool.baseFees || 0) / Math.pow(10, baseDecimals);
    const baseFeeDecimal24hAgo =
        (pool.baseFees24hAgo || 0) / Math.pow(10, baseDecimals);
    stats.quoteFeeDecimal = (pool.quoteFees || 0) / Math.pow(10, quoteDecimals);
    const quoteFeeDecimal24hAgo =
        (pool.quoteFees24hAgo || 0) / Math.pow(10, quoteDecimals);

    stats.baseFdvUsd = baseTotalSupplyNum
        ? (baseTotalSupplyNum / Math.pow(10, baseDecimals)) * basePrice
        : undefined;
    stats.quoteFdvUsd = quoteTotalSupplyNum
        ? (quoteTotalSupplyNum / Math.pow(10, quoteDecimals)) * quotePrice
        : undefined;

    stats.baseTvlUsd = stats.baseTvlDecimal * basePrice;
    stats.quoteTvlUsd = stats.quoteTvlDecimal * quotePrice;
    stats.baseVolumeUsd = stats.baseVolumeDecimal * basePrice;
    const baseVolumeUsd24hAgo = baseVolumeDecimal24hAgo * basePrice;
    stats.quoteVolumeUsd = stats.quoteVolumeDecimal * quotePrice;
    const quoteVolumeUsd24hAgo = quoteVolumeDecimal24hAgo * quotePrice;
    stats.baseFeeUsd = stats.baseFeeDecimal * basePrice;
    stats.quoteFeeUsd = stats.quoteFeeDecimal * quotePrice;

    stats.tvlTotalUsd = stats.baseTvlUsd + stats.quoteTvlUsd;
    stats.volumeTotalUsd = (stats.baseVolumeUsd + stats.quoteVolumeUsd) / 2.0;
    const volumeTotalUsd24hAgo =
        (baseVolumeUsd24hAgo + quoteVolumeUsd24hAgo) / 2.0;
    stats.volumeChange24h = stats.volumeTotalUsd - volumeTotalUsd24hAgo;
    stats.feesTotalUsd = stats.baseFeeUsd + stats.quoteFeeUsd;
    const feesTotalUsd24hAgo =
        baseFeeDecimal24hAgo * basePrice + quoteFeeDecimal24hAgo * quotePrice;
    stats.feesChange24h = stats.feesTotalUsd - feesTotalUsd24hAgo;

    const baseMoneyness: number = getMoneynessRank(pool.base.symbol);
    const quoteMoneyness: number = getMoneynessRank(pool.quote.symbol);

    const shouldInvert = baseMoneyness < quoteMoneyness;
    stats.isBaseTokenMoneynessGreaterOrEqual = baseMoneyness >= quoteMoneyness;

    stats.priceChange24h =
        pool.priceSwap24hAgo &&
        pool.lastPriceSwap &&
        pool.priceSwap24hAgo > 0 &&
        pool.lastPriceSwap > 0
            ? shouldInvert
                ? pool.priceSwap24hAgo / pool.lastPriceSwap - 1.0
                : pool.lastPriceSwap / pool.priceSwap24hAgo - 1.0
            : undefined;

    stats.apr =
        stats.feesChange24h && stats.tvlTotalUsd
            ? (stats.feesChange24h / stats.tvlTotalUsd) * 100 * 365
            : undefined;

    stats.displayPrice = !stats.isBaseTokenMoneynessGreaterOrEqual
        ? 1 /
          toDisplayPrice(
              pool.lastPriceSwap || 0,
              pool.base.decimals,
              pool.quote.decimals,
          )
        : toDisplayPrice(
              pool.lastPriceSwap || 0,
              pool.base.decimals,
              pool.quote.decimals,
          );

    stats.displayPriceString = getFormattedNumber({
        value: stats.displayPrice,
        abbrevThreshold: 10000000, // use 'm', 'b' format > 10m
    });

    if (stats.priceChange24h === undefined || stats.volumeChange24h === 0) {
        stats.priceChangePercent = '';
    } else if (stats.priceChange24h * 100 >= 0.01) {
        stats.priceChangePercent =
            '+' +
            (stats.priceChange24h * 100).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }) +
            '%';
    } else if (stats.priceChange24h * 100 <= -0.01) {
        stats.priceChangePercent =
            (stats.priceChange24h * 100).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }) + '%';
    } else {
        stats.priceChangePercent = 'No Change';
    }

    const tokenPriceForUsd = pool.isBaseTokenMoneynessGreaterOrEqual
        ? stats.baseUsdPrice || 0
        : stats.quoteUsdPrice || 0;

    stats.usdPriceMoneynessBased = (stats.displayPrice || 0) * tokenPriceForUsd;

    stats.name = stats.isBaseTokenMoneynessGreaterOrEqual
        ? `${pool.quote.symbol} / ${pool.base.symbol}`
        : `${pool.base.symbol} / ${pool.quote.symbol}`;

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
    lastPriceSwap: number;
    feeRate: number;
    isHistorical: boolean;
}

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
    ambientTokenList?: TokenIF[],
): Promise<DexAggStatsIF | undefined>;

// fn signature to return chain stats as individual data points
export async function getChainStats(
    returnAs: 'expanded',
    chainId: string,
    crocEnv: CrocEnv,
    GCGO_URL: string,
    cachedFetchTokenPrice: TokenPriceFn,
    tokenCount: number,
    ambientTokenList?: TokenIF[],
): Promise<DexTokenAggServerIF[] | undefined>;

// overloaded fn to return chain stats in expanded or cumulative form
export async function getChainStats(
    returnAs: 'cumulative' | 'expanded',
    chainId: string,
    crocEnv: CrocEnv,
    GCGO_URL: string,
    cachedFetchTokenPrice: TokenPriceFn,
    tokenCount: number,
    ambientTokenList?: TokenIF[],
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
                    ambientTokenList,
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
    ambientTokenList?: TokenIF[],
): Promise<DexAggStatsIF> {
    const subAggs = await Promise.all(
        tokenStats.map((t) =>
            expandTokenStats(
                t,
                chainId,
                crocEnv,
                cachedFetchTokenPrice,
                ambientTokenList,
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
    ambientTokenList?: TokenIF[],
): Promise<DexAggStatsIF> {
    // check if tokenUniv includes the token's decimals value
    const token = ambientTokenList?.find(
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
