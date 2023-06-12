import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import {
    GRAPHCACHE_SMALL_URL,
    GRAPHCACHE_URL,
    IS_LOCAL_ENV,
} from '../../constants';
import {
    getMainnetEquivalent,
    translateMainnetForGraphcache,
} from '../../utils/data/testTokenMap';
import { CandlesByPoolAndDuration } from '../../utils/state/graphDataSlice';
import { TokenPriceFn } from './fetchTokenPrice';
import { memoizeTransactionGraphFn } from './memoizePromiseFn';

interface CandleDataServerIF {
    priceOpen: number;
    priceClose: number;
    minPrice: number;
    maxPrice: number;
    volumeBase: number;
    volumeQuote: number;
    tvlBase: number;
    tvlQuote: number;
    feeRateOpen: number;
    feeRateClose: number;
    period: number;
    time: number;
}

export interface CandleData {
    time: number;
    period: number;
    tvlData: {
        time: number;
        tvl: number;
    };
    volumeUSD: number;
    averageLiquidityFee: number;
    minPriceDecimalCorrected: number;
    maxPriceDecimalCorrected: number;
    priceOpenDecimalCorrected: number;
    priceCloseDecimalCorrected: number;
    invMinPriceDecimalCorrected: number;
    invMaxPriceDecimalCorrected: number;
    invPriceOpenDecimalCorrected: number;
    invPriceCloseDecimalCorrected: number;
    priceCloseExclMEVDecimalCorrected: number;
    invPriceCloseExclMEVDecimalCorrected: number;
    minPriceExclMEVDecimalCorrected: number;
    invMinPriceExclMEVDecimalCorrected: number;
    maxPriceExclMEVDecimalCorrected: number;
    invMaxPriceExclMEVDecimalCorrected: number;
    priceOpenExclMEVDecimalCorrected: number;
    invPriceOpenExclMEVDecimalCorrected: number;
    isCrocData: boolean;
}

export async function fetchCandleSeriesCroc(
    isFetchEnabled: boolean,
    chainData: ChainSpec,
    period: number,
    baseTokenAddress: string,
    quoteTokenAddress: string,
    time: number,
    nCandles: number,
    crocEnv: CrocEnv,
    cachedFetchTokenPrice: TokenPriceFn,
): Promise<CandlesByPoolAndDuration | undefined> {
    if (!isFetchEnabled) {
        return undefined;
    }

    const candleSeriesEndpoint = GRAPHCACHE_SMALL_URL + '/pool_candles';

    const reqOptions = new URLSearchParams({
        base: baseTokenAddress,
        quote: quoteTokenAddress,
        poolIdx: chainData.poolIndex.toString(),
        period: period.toString(),
        n: capNumDurations(nCandles).toString(),
        chainId: chainData.chainId,
    });

    if (time > 0) {
        reqOptions.set('time', time.toString()); // optional
    }

    return fetch(candleSeriesEndpoint + '?' + reqOptions)
        .then((response) => response?.json())
        .then(async (json) => {
            if (!json?.data) {
                return undefined;
            }
            const payload = json?.data as CandleDataServerIF[];

            const candles = expandPoolStats(
                payload,
                baseTokenAddress,
                quoteTokenAddress,
                chainData.poolIndex,
                chainData.chainId,
                crocEnv,
                cachedFetchTokenPrice,
            );

            return {
                pool: {
                    baseAddress: baseTokenAddress,
                    quoteAddress: quoteTokenAddress,
                    poolIdx: chainData.poolIndex,
                    chainId: chainData.chainId,
                },

                duration: period,
                candles: await candles,
            };
        })
        .catch((e) => {
            console.warn(e);
            return undefined;
        });
}

function capNumDurations(numDurations: number): number {
    const MAX_NUM_DURATIONS = 5000;
    const MIN_NUM_DURATIONS = 1;
    if (numDurations > MAX_NUM_DURATIONS) {
        console.warn(`Candle fetch n=${numDurations} exceeds max cap.`);
        return MAX_NUM_DURATIONS;
    } else if (numDurations < MIN_NUM_DURATIONS) {
        console.warn(`Candle fetch n=${numDurations} non-positive.`);
        return MIN_NUM_DURATIONS;
    }
    return numDurations;
}

async function expandPoolStats(
    payload: CandleDataServerIF[],
    base: string,
    quote: string,
    poolIdx: number,
    chainId: string,
    crocEnv: CrocEnv,
    cachedFetchTokenPrice: TokenPriceFn,
): Promise<CandleData[]> {
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

    const baseDecimals = crocEnv.token(base).decimals;
    const quoteDecimals = crocEnv.token(quote).decimals;

    return decorateCandleData(
        payload,
        await baseDecimals,
        await quoteDecimals,
        await basePrice,
        await quotePrice,
    );
}

function decorateCandleData(
    payload: CandleDataServerIF[],
    baseDecimals: number,
    quoteDecimals: number,
    basePrice: number,
    quotePrice: number,
): CandleData[] {
    return payload.map((p) => {
        const baseDecMult = 1 / Math.pow(10, baseDecimals);
        const quoteDecMult = 1 / Math.pow(10, quoteDecimals);
        const baseUsdMult = baseDecMult * basePrice;
        const quoteUsdMult = quoteDecMult * quotePrice;
        const priceDecMult = baseDecMult / quoteDecMult;

        return {
            time: p.time,
            period: p.period,
            isCrocData: true,
            tvlData: {
                time: p.time,
                tvl: p.tvlBase * baseUsdMult + p.tvlQuote * quoteDecMult,
            },
            volumeUSD:
                (p.volumeBase * baseUsdMult + p.volumeQuote * quoteUsdMult) /
                2.0,
            averageLiquidityFee: (p.feeRateOpen + p.feeRateClose) / 2.0,
            minPriceDecimalCorrected: p.minPrice * priceDecMult,
            maxPriceDecimalCorrected: p.maxPrice * priceDecMult,
            priceOpenDecimalCorrected: p.priceClose * priceDecMult,
            priceCloseDecimalCorrected: p.priceClose * priceDecMult,
            invMinPriceDecimalCorrected: 1 / (p.minPrice * priceDecMult),
            invMaxPriceDecimalCorrected: 1 / (p.maxPrice * priceDecMult),
            invPriceOpenDecimalCorrected: 1 / (p.priceClose * priceDecMult),
            invPriceCloseDecimalCorrected: 1 / (p.priceClose * priceDecMult),
            minPriceExclMEVDecimalCorrected: p.minPrice * priceDecMult,
            maxPriceExclMEVDecimalCorrected: p.maxPrice * priceDecMult,
            priceOpenExclMEVDecimalCorrected: p.priceClose * priceDecMult,
            priceCloseExclMEVDecimalCorrected: p.priceClose * priceDecMult,
            invMinPriceExclMEVDecimalCorrected: 1 / (p.minPrice * priceDecMult),
            invMaxPriceExclMEVDecimalCorrected: 1 / (p.maxPrice * priceDecMult),
            invPriceOpenExclMEVDecimalCorrected:
                1 / (p.priceClose * priceDecMult),
            invPriceCloseExclMEVDecimalCorrected:
                1 / (p.priceClose * priceDecMult),
        };
    });
}

export const fetchCandleSeriesUniswap = async (
    isFetchEnabled: boolean,
    mainnetBaseTokenAddress: string,
    mainnetQuoteTokenAddress: string,
    chainData: ChainSpec,
    period: number,
    baseTokenAddress: string,
    quoteTokenAddress: string,
    time: string,
    candleNeeded: string,
) => {
    console.log('Fetch candle series');
    const { baseToken: mainnetBase, quoteToken: mainnetQuote } =
        translateMainnetForGraphcache(
            mainnetBaseTokenAddress,
            mainnetQuoteTokenAddress,
        );

    const httpGraphCacheServerDomain = GRAPHCACHE_URL;
    if (isFetchEnabled) {
        try {
            if (httpGraphCacheServerDomain) {
                const candleSeriesCacheEndpoint =
                    GRAPHCACHE_URL + '/candle_series?';

                return fetch(
                    candleSeriesCacheEndpoint +
                        new URLSearchParams({
                            base: mainnetBase.toLowerCase(),
                            quote: mainnetQuote.toLowerCase(),
                            poolIdx: '36000',
                            // poolIdx: chainData.poolIndex.toString(),
                            period: period.toString(),
                            time: time, // optional
                            n: candleNeeded, // positive integer
                            chainId: '0x1',
                            dex: 'all',
                            poolStats: 'true',
                            concise: 'true',
                            poolStatsChainIdOverride: chainData.chainId,
                            poolStatsBaseOverride:
                                baseTokenAddress.toLowerCase(),
                            poolStatsQuoteOverride:
                                quoteTokenAddress.toLowerCase(),
                            poolStatsPoolIdxOverride:
                                chainData.poolIndex.toString(),
                        }),
                )
                    .then((response) => response?.json())
                    .then((json) => {
                        const candles = json?.data;
                        if (candles) {
                            return {
                                duration: period,
                                candles: candles,
                            };
                        }
                    })
                    .catch(console.error);
            }
        } catch (error) {
            console.error({ error });
        }
    }
};

export type TransactionGraphDataFn = (
    isFetchEnabled: boolean,
    mainnetBaseTokenAddress: string,
    mainnetQuoteTokenAddress: string,
    chainData: ChainSpec,
    period: number,
    baseTokenAddress: string,
    quoteTokenAddress: string,
    time: string,
    candleNeeded: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<any>;

export function memoizeFetchTransactionGraphData(): TransactionGraphDataFn {
    return memoizeTransactionGraphFn(
        fetchCandleSeriesUniswap,
    ) as TransactionGraphDataFn;
}
