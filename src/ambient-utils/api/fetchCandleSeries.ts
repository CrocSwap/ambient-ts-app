import { ChainSpec, CrocEnv, toDisplayPrice } from '@crocswap-libs/sdk';
import { CACHE_UPDATE_FREQ_IN_MS, GCGO_OVERRIDE_URL } from '../constants';
import {
    CandlesByPoolAndDurationIF,
    CandleDataIF,
    CandleDataServerIF,
} from '../types/candleData';
import { TokenPriceFn } from './fetchTokenPrice';
import { SpotPriceFn } from '../dataLayer';

export async function fetchCandleSeriesHybrid(
    isFetchEnabled: boolean,
    chainData: ChainSpec,
    graphCacheUrl: string,
    period: number,
    baseTokenAddress: string,
    quoteTokenAddress: string,
    endTime: number,
    nCandles: number,
    crocEnv: CrocEnv,
    cachedFetchTokenPrice: TokenPriceFn,
    cachedQuerySpotPrice: SpotPriceFn,
    signal?: AbortSignal,
): Promise<CandlesByPoolAndDurationIF | undefined> {
    const candles = await fetchCandleSeriesCroc(
        isFetchEnabled,
        chainData,
        graphCacheUrl,
        period,
        baseTokenAddress,
        quoteTokenAddress,
        endTime,
        nCandles,
        crocEnv,
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        signal,
    );

    if (!candles) {
        return undefined;
    }

    // Check to see if Croc candles are sufficient
    if (candles.candles.length >= nCandles) {
        return candles;
    }

    if (endTime == 0) {
        endTime = Math.floor(Date.now() / 1000);
    }

    // try {
    //     const stitchTime = Math.floor(
    //         Math.min(endTime, ...candles.candles.map((c) => c.time)),
    //     );
    //     const stitchN = nCandles - candles.candles.length;

    //     // If not backfill with Uniswap candles
    //     const uniCandles = await fetchCandleSeriesUniswap(
    //         isFetchEnabled,
    //         baseTokenAddress,
    //         quoteTokenAddress,
    //         chainData,
    //         period,
    //         baseTokenAddress,
    //         quoteTokenAddress,
    //         stitchTime.toString(),
    //         stitchN.toString(),
    //         signal,
    //     );

    //     if (!uniCandles) {
    //         return candles;
    //     }

    //     // Sanitize volume, tvl and fee data from Uni data
    //     uniCandles.forEach((u) => {
    //         u.tvlData.tvl = 0;
    //         u.volumeUSD = 0;
    //         u.averageLiquidityFee = 0;
    //     });

    //     candles.candles = candles.candles.concat(uniCandles);
    // } catch (e) {
    //     if (e.name === 'AbortError') {
    //         console.warn('Zoom request cancelled');
    //     } else {
    //         console.warn(e);
    //     }
    // }

    return candles;
}

export async function fetchCandleSeriesCroc(
    isFetchEnabled: boolean,
    chainData: ChainSpec,
    graphCacheUrl: string,
    period: number,
    baseTokenAddress: string,
    quoteTokenAddress: string,
    endTime: number,
    nCandles: number,
    crocEnv: CrocEnv,
    cachedFetchTokenPrice: TokenPriceFn,
    cachedQuerySpotPrice: SpotPriceFn,
    signal?: AbortSignal,
): Promise<CandlesByPoolAndDurationIF | undefined> {
    if (!isFetchEnabled) {
        return undefined;
    }

    const candleSeriesEndpoint = GCGO_OVERRIDE_URL
        ? GCGO_OVERRIDE_URL + '/pool_candles'
        : graphCacheUrl + '/pool_candles';

    if (endTime == 0) {
        endTime = Math.floor(Date.now() / 1000);
    }

    const startTimeRough = endTime - nCandles * period;
    const startTime = Math.ceil(startTimeRough / period) * period;

    const reqOptions = new URLSearchParams({
        base: baseTokenAddress,
        quote: quoteTokenAddress,
        poolIdx: chainData.poolIndex.toString(),
        period: period.toString(),
        n: capNumDurations(nCandles).toString(),
        time: startTime.toString(),
        chainId: chainData.chainId,
    });

    return fetch(candleSeriesEndpoint + '?' + reqOptions, { signal })
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
                cachedQuerySpotPrice,
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
            if (e.name === 'AbortError') {
                console.warn('Zoom request cancelled');
            } else {
                console.warn(e);
            }
            return undefined;
        });
}

function capNumDurations(numDurations: number): number {
    const MAX_NUM_DURATIONS = 5000;
    const MIN_NUM_DURATIONS = 1;

    // Avoid rounding off last candle
    numDurations = numDurations + 1;

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
    cachedQuerySpotPrice: SpotPriceFn,
): Promise<CandleDataIF[]> {
    const baseDecimals = await crocEnv.token(base).decimals;
    const quoteDecimals = await crocEnv.token(quote).decimals;

    const basePricePromise = cachedFetchTokenPrice(base, chainId, crocEnv);
    const quotePricePromise = cachedFetchTokenPrice(quote, chainId, crocEnv);

    const baseUsdPrice = (await basePricePromise)?.usdPrice;
    const quoteUsdPrice = (await quotePricePromise)?.usdPrice;

    const spotPrice = await cachedQuerySpotPrice(
        crocEnv,
        base,
        quote,
        chainId,
        Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS),
    );

    const displayPrice = toDisplayPrice(spotPrice, baseDecimals, quoteDecimals);

    const basePrice = baseUsdPrice
        ? baseUsdPrice
        : displayPrice && quoteUsdPrice
        ? quoteUsdPrice / displayPrice
        : 0.0;
    const quotePrice = quoteUsdPrice
        ? quoteUsdPrice
        : displayPrice && baseUsdPrice
        ? baseUsdPrice * displayPrice
        : 0.0;

    return decorateCandleData(
        payload,
        baseDecimals,
        quoteDecimals,
        basePrice,
        quotePrice,
    ).reverse();
}

function decorateCandleData(
    payload: CandleDataServerIF[],
    baseDecimals: number,
    quoteDecimals: number,
    basePrice: number,
    quotePrice: number,
): CandleDataIF[] {
    const PRE_BURN_TIME = 1686176723; // Based on mainnet deployment

    return payload
        .filter((p) => p.priceOpen > 0 && p.time > PRE_BURN_TIME)
        .map((p) => {
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
                    tvl: p.tvlBase * baseUsdMult + p.tvlQuote * quoteUsdMult,
                },
                volumeUSD:
                    (p.volumeBase * baseUsdMult +
                        p.volumeQuote * quoteUsdMult) /
                    2.0,
                averageLiquidityFee: (p.feeRateOpen + p.feeRateClose) / 2.0,
                minPriceDecimalCorrected: p.minPrice * priceDecMult,
                maxPriceDecimalCorrected: p.maxPrice * priceDecMult,
                priceOpenDecimalCorrected: p.priceOpen * priceDecMult,
                priceCloseDecimalCorrected: p.priceClose * priceDecMult,
                invMinPriceDecimalCorrected: 1 / (p.minPrice * priceDecMult),
                invMaxPriceDecimalCorrected: 1 / (p.maxPrice * priceDecMult),
                invPriceOpenDecimalCorrected: 1 / (p.priceOpen * priceDecMult),
                invPriceCloseDecimalCorrected:
                    1 / (p.priceClose * priceDecMult),
                minPriceExclMEVDecimalCorrected: p.minPrice * priceDecMult,
                maxPriceExclMEVDecimalCorrected: p.maxPrice * priceDecMult,
                priceOpenExclMEVDecimalCorrected: p.priceOpen * priceDecMult,
                priceCloseExclMEVDecimalCorrected: p.priceClose * priceDecMult,
                invMinPriceExclMEVDecimalCorrected:
                    1 / (p.minPrice * priceDecMult),
                invMaxPriceExclMEVDecimalCorrected:
                    1 / (p.maxPrice * priceDecMult),
                invPriceOpenExclMEVDecimalCorrected:
                    1 / (p.priceOpen * priceDecMult),
                invPriceCloseExclMEVDecimalCorrected:
                    1 / (p.priceClose * priceDecMult),
            };
        });
}

// function translateUniswapTokens(
//     baseToken: string,
//     quoteToken: string,
// ): { baseToken: string; quoteToken: string } {
//     const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
//     const ZERO = '0x0000000000000000000000000000000000000000';
//     if (baseToken === WETH) {
//         return { baseToken: ZERO, quoteToken: quoteToken };
//     } else if (quoteToken === WETH) {
//         return { baseToken: ZERO, quoteToken: baseToken };
//     } else {
//         return { baseToken: baseToken, quoteToken: quoteToken };
//     }
// }

// async function fetchCandleSeriesUniswap(
//     isFetchEnabled: boolean,
//     mainnetBaseTokenAddress: string,
//     mainnetQuoteTokenAddress: string,
//     chainData: ChainSpec,
//     period: number,
//     baseTokenAddress: string,
//     quoteTokenAddress: string,
//     time: string,
//     candleNeeded: string,
//     signal?: AbortSignal,
// ): Promise<CandleDataIF[] | undefined | void> {
//     const { baseToken: mainnetBase, quoteToken: mainnetQuote } =
//         translateUniswapTokens(
//             mainnetBaseTokenAddress,
//             mainnetQuoteTokenAddress,
//         );

//     const httpGraphCacheServerDomain = HISTORICAL_CANDLES_URL;
//     if (isFetchEnabled) {
//         try {
//             if (httpGraphCacheServerDomain) {
//                 const candleSeriesCacheEndpoint =
//                     HISTORICAL_CANDLES_URL + '/candle_series?';

//                 return fetch(
//                     candleSeriesCacheEndpoint +
//                         new URLSearchParams({
//                             base: mainnetBase.toLowerCase(),
//                             quote: mainnetQuote.toLowerCase(),
//                             poolIdx: '36000',
//                             // poolIdx: chainData.poolIndex.toString(),
//                             period: period.toString(),
//                             time: time, // optional
//                             n: candleNeeded, // positive integer
//                             chainId: chainData.chainId,
//                             dex: 'all',
//                             poolStats: 'true',
//                             concise: 'true',
//                             poolStatsChainIdOverride: chainData.chainId,
//                             poolStatsBaseOverride:
//                                 baseTokenAddress.toLowerCase(),
//                             poolStatsQuoteOverride:
//                                 quoteTokenAddress.toLowerCase(),
//                             poolStatsPoolIdxOverride:
//                                 chainData.poolIndex.toString(),
//                         }),
//                     { signal },
//                 )
//                     .then((response) => response?.json())
//                     .then((json) => {
//                         const candles = json?.data;
//                         if (candles) {
//                             return candles as CandleDataIF[];
//                         }
//                     })
//                     .catch(console.warn);
//             }
//         } catch (error) {
//             console.warn({ error });
//         }
//     }
// }
