import { CrocEnv, toDisplayPrice } from '@crocswap-libs/sdk';
import { CACHE_UPDATE_FREQ_IN_MS } from '../constants';
import { SpotPriceFn } from '../dataLayer';
import { PoolStatIF, TokenIF } from '../types';
import {
    CandleDataIF,
    CandleDataServerIF,
    CandlesByPoolAndDurationIF,
} from '../types/candleData';
import { TokenPriceFn } from './fetchTokenPrice';

export async function fetchCandleSeriesHybrid(
    isFetchEnabled: boolean,
    chainId: string,
    poolIndex: number,
    GCGO_URL: string,
    period: number,
    baseToken: TokenIF,
    quoteToken: TokenIF,
    endTime: number,
    nCandles: number,
    crocEnv: CrocEnv,
    cachedFetchTokenPrice: TokenPriceFn,
    cachedQuerySpotPrice: SpotPriceFn,
    poolData?: PoolStatIF,
): Promise<CandlesByPoolAndDurationIF | undefined> {
    const candles = await fetchCandleSeriesCroc(
        isFetchEnabled,
        chainId,
        poolIndex,
        GCGO_URL,
        period,
        baseToken,
        quoteToken,
        endTime,
        nCandles,
        crocEnv,
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        poolData,
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

    return candles;
}

export async function fetchCandleSeriesCroc(
    isFetchEnabled: boolean,
    chainId: string,
    poolIndex: number,
    GCGO_URL: string,
    period: number,
    baseToken: TokenIF,
    quoteToken: TokenIF,
    endTime: number,
    nCandles: number,
    crocEnv: CrocEnv,
    cachedFetchTokenPrice: TokenPriceFn,
    cachedQuerySpotPrice: SpotPriceFn,
    poolData?: PoolStatIF,
): Promise<CandlesByPoolAndDurationIF | undefined> {
    if (!isFetchEnabled) {
        return undefined;
    }

    const candleSeriesEndpoint = GCGO_URL + '/pool_candles';

    let startTime = 0;
    if (endTime != 0) {
        const startTimeRough = endTime - nCandles * period;
        startTime = Math.ceil(startTimeRough / period) * period;
    }

    const reqOptions = new URLSearchParams({
        base: baseToken.address.toLowerCase(),
        quote: quoteToken.address.toLowerCase(),
        poolIdx: poolIndex.toString(),
        period: period.toString(),
        n: capNumDurations(nCandles).toString(),
        time: startTime.toString(),
        chainId: chainId.toLowerCase(),
    });

    return fetch(candleSeriesEndpoint + '?' + reqOptions)
        .then((response) => response?.json())
        .then(async (json) => {
            if (!json?.data) {
                return undefined;
            }
            const payload = json?.data as CandleDataServerIF[];

            const candles = expandPoolStatsCandle(
                payload,
                baseToken,
                quoteToken,
                chainId,
                crocEnv,
                cachedFetchTokenPrice,
                cachedQuerySpotPrice,
                poolData,
            );

            return {
                pool: {
                    baseAddress: baseToken.address,
                    quoteAddress: quoteToken.address,
                    poolIdx: poolIndex,
                    chainId: chainId,
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

async function expandPoolStatsCandle(
    payload: CandleDataServerIF[],
    baseToken: TokenIF,
    quoteToken: TokenIF,
    chainId: string,
    crocEnv: CrocEnv,
    cachedFetchTokenPrice: TokenPriceFn,
    cachedQuerySpotPrice: SpotPriceFn,
    poolData?: PoolStatIF,
): Promise<CandleDataIF[]> {
    const baseDecimals = baseToken.decimals;
    const quoteDecimals = quoteToken.decimals;

    const basePricePromise = cachedFetchTokenPrice(baseToken.address, chainId);
    const quotePricePromise = cachedFetchTokenPrice(
        quoteToken.address,
        chainId,
    );

    const baseUsdPrice = poolData?.basePrice
        ? poolData.basePrice
        : (await basePricePromise)?.usdPrice;
    const quoteUsdPrice = poolData?.quotePrice
        ? poolData.quotePrice
        : (await quotePricePromise)?.usdPrice;

    let spotPrice;
    if (poolData?.activeTradePoolStats?.lastPriceSwap) {
        spotPrice = poolData?.activeTradePoolStats?.lastPriceSwap;
    } else if ((await crocEnv.context).chain.chainId === chainId) {
        spotPrice = await cachedQuerySpotPrice(
            crocEnv,
            baseToken.address,
            quoteToken.address,
            chainId,
            Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS),
        );
    } else {
        return [];
    }

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
        .filter((p) => p.time > PRE_BURN_TIME)
        .map((p) => {
            const baseDecMult = 1 / Math.pow(10, baseDecimals);
            const quoteDecMult = 1 / Math.pow(10, quoteDecimals);
            const baseUsdMult = baseDecMult * basePrice;
            const quoteUsdMult = quoteDecMult * quotePrice;
            const priceDecMult = baseDecMult / quoteDecMult;

            const openPrice = p.priceOpen;
            const closePrice = p.priceClose;
            const maxPrice = p.maxPrice;
            const minPrice = p.minPrice;

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
                minPriceDecimalCorrected: minPrice * priceDecMult,
                maxPriceDecimalCorrected: maxPrice * priceDecMult,
                priceOpenDecimalCorrected: openPrice * priceDecMult,
                priceCloseDecimalCorrected: closePrice * priceDecMult,
                invMinPriceDecimalCorrected: 1 / (minPrice * priceDecMult),
                invMaxPriceDecimalCorrected: 1 / (maxPrice * priceDecMult),
                invPriceOpenDecimalCorrected: 1 / (openPrice * priceDecMult),
                invPriceCloseDecimalCorrected: 1 / (closePrice * priceDecMult),
                minPriceExclMEVDecimalCorrected: minPrice * priceDecMult,
                maxPriceExclMEVDecimalCorrected: maxPrice * priceDecMult,
                priceOpenExclMEVDecimalCorrected: openPrice * priceDecMult,
                priceCloseExclMEVDecimalCorrected: closePrice * priceDecMult,
                invMinPriceExclMEVDecimalCorrected:
                    1 / (minPrice * priceDecMult),
                invMaxPriceExclMEVDecimalCorrected:
                    1 / (maxPrice * priceDecMult),
                invPriceOpenExclMEVDecimalCorrected:
                    1 / (openPrice * priceDecMult),
                invPriceCloseExclMEVDecimalCorrected:
                    1 / (closePrice * priceDecMult),
            };
        });
}
