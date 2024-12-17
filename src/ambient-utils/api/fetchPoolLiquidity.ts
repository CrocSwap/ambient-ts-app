import { CrocEnv, tickToPrice, toDisplayPrice } from '@crocswap-libs/sdk';
import { SpotPriceFn } from '../dataLayer';
import { TokenPriceFn } from './fetchTokenPrice';

export const fetchPoolLiquidity = async (
    chainId: string,
    base: string,
    baseTokenDecimals: number,
    quote: string,
    quoteTokenDecimals: number,
    poolIdx: number,
    crocEnv: CrocEnv,
    GCGO_URL: string,
    cachedFetchTokenPrice: TokenPriceFn,
    cachedQuerySpotTick: SpotPriceFn,
    currentPoolPriceTick?: number | undefined,
): Promise<LiquidityDataIF | undefined> => {
    const poolLiquidityCacheEndpoint = GCGO_URL + '/pool_liq_curve?';
    return fetch(
        poolLiquidityCacheEndpoint +
            new URLSearchParams({
                chainId: chainId,
                base: base,
                quote: quote,
                poolIdx: poolIdx.toString(),
            }),
    )
        .then((response) => response.json())
        .then(async (json) => {
            if (!json.data) {
                return undefined;
            }
            const bumps = json.data as LiquidityCurveServerIF;
            return await expandLiquidityData(
                bumps,
                base,
                baseTokenDecimals,
                quote,
                quoteTokenDecimals,
                poolIdx,
                chainId,
                crocEnv,
                cachedFetchTokenPrice,
                cachedQuerySpotTick,
                currentPoolPriceTick,
            );
        });
};

async function expandLiquidityData(
    liq: LiquidityCurveServerIF,
    base: string,
    baseTokenDecimals: number,
    quote: string,
    quoteTokenDecimals: number,
    poolIdx: number,
    chainId: string,
    crocEnv: CrocEnv,
    cachedFetchTokenPrice: TokenPriceFn,
    cachedQuerySpotTick: SpotPriceFn,
    currentPoolPriceTick?: number | undefined,
): Promise<LiquidityDataIF> {
    // const pool = crocEnv.pool(base, quote);
    const everyOneMinute = Math.floor(Date.now() / 60000);

    let curveTick: number;
    if (currentPoolPriceTick) {
        curveTick = currentPoolPriceTick;
    } else {
        curveTick = await cachedQuerySpotTick(
            crocEnv,
            base,
            quote,
            chainId,
            everyOneMinute,
        );
    }

    const basePricePromise = cachedFetchTokenPrice(base, chainId, crocEnv);
    const quotePricePromise = cachedFetchTokenPrice(quote, chainId, crocEnv);

    const basePrice = (await basePricePromise)?.usdPrice || 0.0;
    const quotePrice = (await quotePricePromise)?.usdPrice || 0.0;

    const ranges = bumpsToRanges(
        liq,
        curveTick,
        baseTokenDecimals,
        quoteTokenDecimals,
        basePrice,
        quotePrice,
    );

    console.log({ curveTick, liq, ranges });

    return {
        currentTick: curveTick,
        ranges: ranges,
        curveState: {
            base: base,
            quote: quote,
            poolIdx: poolIdx,
            chainId: chainId,
        },
    };
}

function bumpsToRanges(
    curve: LiquidityCurveServerIF,
    tick: number,
    baseDecimals: number,
    quoteDecimals: number,
    basePrice: number,
    quotePrice: number,
): LiquidityParsedDataIF {
    let bumps = curve.liquidityBumps ? curve.liquidityBumps : [];

    // Insert a synthetic bump right at the current price tick, so curve is smooth
    if (bumps.filter((b) => b.bumpTick == tick).length == 0) {
        bumps = bumps.concat({
            bumpTick: tick,
            liquidityDelta: 0,
            latestUpdateTime: 0,
        });
    }

    bumps = bumps.sort((a, b) => a.bumpTick - b.bumpTick);

    const isAmbient = bumps.some((i) => i.bumpTick === 0);

    let lastTick = -Infinity;
    let liqRunning = curve.ambientLiq;

    let ranges = bumps.map((b) => {
        const lowerPrice = tickToPrice(lastTick);
        const upperPrice = tickToPrice(b.bumpTick);
        const lowerPriceDisp = toDisplayPrice(
            lowerPrice,
            baseDecimals,
            quoteDecimals,
        );
        const upperPriceDisp = toDisplayPrice(
            upperPrice,
            baseDecimals,
            quoteDecimals,
        );

        const retVal = {
            lowerBound: lastTick,
            lowerBoundPrice: lowerPrice,
            lowerBoundInvPrice: 1 / lowerPrice,
            lowerBoundPriceDecimalCorrected: lowerPriceDisp,
            lowerBoundInvPriceDecimalCorrected: 1 / lowerPriceDisp,
            upperBound: b.bumpTick,
            upperBoundPrice: upperPrice,
            upperBoundInvPrice: 1 / upperPrice,
            upperBoundPriceDecimalCorrected: upperPriceDisp,
            upperBoundInvPriceDecimalCorrected: 1 / upperPriceDisp,
            activeLiq: liqRunning,

            cumBidLiq: 0.0,
            cumAskLiq: 0.0,
            deltaBase: 0.0,
            deltaQuote: 0.0,
            deltaAverageUSD: 0.0,
            cumDeltaBase: 0.0,
            cumDeltaAsk: 0.0,
            cumDeltaQuote: 0.0,
            cumAverageUSD: 0.0,
        };

        const deltaSqrtPrice =
            retVal.lowerBound >= tick
                ? Math.sqrt(retVal.upperBoundPrice) -
                  Math.sqrt(retVal.lowerBoundPrice)
                : Math.sqrt(retVal.lowerBoundPrice) -
                  Math.sqrt(retVal.upperBoundPrice);
        const deltaSqrtInvPrice =
            retVal.upperBound <= tick
                ? Math.sqrt(retVal.upperBoundInvPrice) -
                  Math.sqrt(retVal.lowerBoundInvPrice)
                : Math.sqrt(retVal.lowerBoundInvPrice) -
                  Math.sqrt(retVal.upperBoundInvPrice);

        retVal.deltaBase = -1 * retVal.activeLiq * deltaSqrtPrice;
        retVal.deltaQuote = -1 * retVal.activeLiq * deltaSqrtInvPrice;

        const deltaBaseDecimal = retVal.deltaBase / Math.pow(10, baseDecimals);
        const deltaQuoteDecimal =
            retVal.deltaQuote / Math.pow(10, quoteDecimals);
        const deltaBaseUSD = deltaBaseDecimal * basePrice;
        const deltaQuoteUSD = deltaQuoteDecimal * quotePrice;

        retVal.deltaAverageUSD =
            (Math.abs(deltaBaseUSD) + Math.abs(deltaQuoteUSD)) / 2;

        lastTick = b.bumpTick;
        liqRunning += b.liquidityDelta;

        return retVal;
    });

    if (!isAmbient) {
        ranges = ranges.filter((i) => i.lowerBound !== -Infinity);
    }

    const bidRanges = ranges.filter((r) => r.upperBound <= tick);
    const askRanges = ranges.filter((r) => r.lowerBound >= tick);

    /* Technically we may want to split the range that covers the price
     * tick itself into sub-ranges below and above the tick. But be careful
     * of the math, because the width would not be the same. */

    let cumBidLiq = 0;
    let cumDeltaBase = 0;
    let cumDeltaQuote = 0;
    bidRanges.reverse().forEach((r) => {
        r.cumBidLiq = cumBidLiq + r.activeLiq;
        cumBidLiq += r.activeLiq;

        cumDeltaBase += r.deltaBase;
        cumDeltaQuote += r.deltaQuote;
        r.cumDeltaBase = cumDeltaBase;
        r.cumDeltaQuote += cumDeltaQuote;
    });
    bidRanges.reverse();

    let cumAskLiq = 0;
    cumDeltaBase = 0;
    cumDeltaQuote = 0;
    askRanges.forEach((r) => {
        r.cumAskLiq = cumAskLiq + r.activeLiq;
        cumAskLiq += r.activeLiq;

        cumDeltaBase += r.deltaBase;
        cumDeltaQuote += r.deltaQuote;
        r.cumDeltaBase = cumDeltaBase;
        r.cumDeltaQuote += cumDeltaQuote;
    });

    bidRanges.forEach((r) => {
        const cumDeltaBaseDecimal = r.cumDeltaBase / Math.pow(10, baseDecimals);
        const cumDeltaQuoteDecimal =
            r.cumDeltaQuote / Math.pow(10, quoteDecimals);
        const cumDeltaBaseUSD = cumDeltaBaseDecimal * basePrice;
        const cumDeltaQuoteUSD = cumDeltaQuoteDecimal * quotePrice;
        r.cumAverageUSD =
            (Math.abs(cumDeltaBaseUSD) + Math.abs(cumDeltaQuoteUSD)) / 2;
    });

    askRanges.forEach((r) => {
        const cumDeltaBaseDecimal = r.cumDeltaBase / Math.pow(10, baseDecimals);
        const cumDeltaQuoteDecimal =
            r.cumDeltaQuote / Math.pow(10, quoteDecimals);
        const cumDeltaBaseUSD = cumDeltaBaseDecimal * basePrice;
        const cumDeltaQuoteUSD = cumDeltaQuoteDecimal * quotePrice;
        r.cumAverageUSD =
            (Math.abs(cumDeltaBaseUSD) + Math.abs(cumDeltaQuoteUSD)) / 2;
    });

    return {
        askRanges: askRanges,
        bidRanges: bidRanges,
        hasAmbientPosition: isAmbient,
    };
}

export interface LiquidityDataIF {
    currentTick: number;
    ranges: LiquidityParsedDataIF;
    curveState: {
        base: string;
        quote: string;
        poolIdx: number;
        chainId: string;
    };
}

export interface LiquidityRangeIF {
    lowerBound: number;
    lowerBoundPrice: number;
    lowerBoundInvPrice: number;
    lowerBoundPriceDecimalCorrected: number;
    lowerBoundInvPriceDecimalCorrected: number;
    upperBound: number;
    upperBoundPrice: number;
    upperBoundInvPrice: number;
    upperBoundPriceDecimalCorrected: number;
    upperBoundInvPriceDecimalCorrected: number;
    activeLiq: number;
    cumAskLiq: number;
    cumBidLiq: number;
    deltaBase: number;
    deltaQuote: number;
    deltaAverageUSD: number;
    cumDeltaBase: number;
    cumDeltaQuote: number;
    cumAverageUSD: number;
}

export interface LiquidityParsedDataIF {
    askRanges: Array<LiquidityRangeIF>;
    bidRanges: Array<LiquidityRangeIF>;
    hasAmbientPosition: boolean;
}

interface LiquidityCurveServerIF {
    ambientLiq: number;
    liquidityBumps: {
        bumpTick: number;
        liquidityDelta: number;
        latestUpdateTime: number;
    }[];
}
