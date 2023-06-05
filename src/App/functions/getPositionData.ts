import { CrocEnv, tickToPrice, toDisplayPrice } from '@crocswap-libs/sdk';
import { PositionIF, TokenIF } from '../../utils/interfaces/exports';
import { memoizeCacheQueryFn } from './memoizePromiseFn';
import { GRAPHCACHE_URL } from '../../constants';
import { memoizeQuerySpotPrice } from './querySpotPrice';
import { getFormattedTokenBalance } from './getFormattedTokenBalance';

const cachedQuerySpotPrice = memoizeQuerySpotPrice();

export const getPositionData = async (
    position: PositionIF,
    tokensOnChain: TokenIF[],
    crocEnv: CrocEnv,
    chainId: string,
    lastBlockNumber: number,
): Promise<PositionIF> => {
    const newPosition = { ...position };

    const baseTokenAddress =
        position.base.length === 40 ? '0x' + position.base : position.base;
    const quoteTokenAddress =
        position.quote.length === 40 ? '0x' + position.quote : position.quote;

    const poolPriceNonDisplay = await cachedQuerySpotPrice(
        crocEnv,
        baseTokenAddress,
        quoteTokenAddress,
        chainId,
        lastBlockNumber,
    );

    const poolPriceInTicks = Math.log(poolPriceNonDisplay) / Math.log(1.0001);
    newPosition.poolPriceInTicks = poolPriceInTicks;

    const isPositionInRange =
        position.positionType === 'ambient' ||
        (position.bidTick <= poolPriceInTicks &&
            poolPriceInTicks <= position.askTick);

    newPosition.isPositionInRange = isPositionInRange;

    const baseTokenDecimals = position.baseDecimals;
    const quoteTokenDecimals = position.quoteDecimals;

    const lowerPriceNonDisplay = tickToPrice(position.bidTick);
    const upperPriceNonDisplay = tickToPrice(position.askTick);

    const lowerPriceDisplayInBase =
        1 /
        toDisplayPrice(
            upperPriceNonDisplay,
            baseTokenDecimals,
            quoteTokenDecimals,
        );

    const upperPriceDisplayInBase =
        1 /
        toDisplayPrice(
            lowerPriceNonDisplay,
            baseTokenDecimals,
            quoteTokenDecimals,
        );

    const lowerPriceDisplayInQuote = toDisplayPrice(
        lowerPriceNonDisplay,
        baseTokenDecimals,
        quoteTokenDecimals,
    );

    const upperPriceDisplayInQuote = toDisplayPrice(
        upperPriceNonDisplay,
        baseTokenDecimals,
        quoteTokenDecimals,
    );

    newPosition.lowRangeShortDisplayInBase = getFormattedTokenBalance(
        lowerPriceDisplayInBase,
        undefined,
        0,
        0,
    );
    newPosition.lowRangeShortDisplayInQuote = getFormattedTokenBalance(
        lowerPriceDisplayInQuote,
        undefined,
        0,
        0,
    );
    newPosition.highRangeShortDisplayInBase = getFormattedTokenBalance(
        upperPriceDisplayInBase,
        undefined,
        0,
        0,
    );
    newPosition.highRangeShortDisplayInQuote = getFormattedTokenBalance(
        upperPriceDisplayInQuote,
        undefined,
        0,
        0,
    );

    const baseTokenLogoURI = tokensOnChain.find(
        (token) =>
            token.address.toLowerCase() === baseTokenAddress.toLowerCase(),
    )?.logoURI;
    const quoteTokenLogoURI = tokensOnChain.find(
        (token) =>
            token.address.toLowerCase() === quoteTokenAddress.toLowerCase(),
    )?.logoURI;

    newPosition.baseTokenLogoURI = baseTokenLogoURI ?? '';
    newPosition.quoteTokenLogoURI = quoteTokenLogoURI ?? '';

    if (position.positionType !== 'ambient') {
        newPosition.lowRangeDisplayInBase = getFormattedTokenBalance(
            lowerPriceDisplayInBase,
        );
        newPosition.highRangeDisplayInBase = getFormattedTokenBalance(
            upperPriceDisplayInBase,
        );

        newPosition.lowRangeDisplayInQuote = getFormattedTokenBalance(
            lowerPriceDisplayInQuote,
        );
        newPosition.highRangeDisplayInQuote = getFormattedTokenBalance(
            upperPriceDisplayInQuote,
        );
    }

    if (position.positionLiqBaseDecimalCorrected) {
        const liqBaseNum = position.positionLiqBaseDecimalCorrected;

        const baseLiqDisplayTruncated = getFormattedTokenBalance(liqBaseNum);

        newPosition.positionLiqBaseTruncated = baseLiqDisplayTruncated;
    }
    if (position.positionLiqQuoteDecimalCorrected) {
        const liqQuoteNum = position.positionLiqQuoteDecimalCorrected;

        const quoteLiqDisplayTruncated = getFormattedTokenBalance(liqQuoteNum);

        newPosition.positionLiqQuoteTruncated = quoteLiqDisplayTruncated;
    }

    return newPosition;
};

export const getPositionStatsJsonAsync = async (
    user: string,
    askTick: number,
    bidTick: number,
    base: string,
    quote: string,
    poolIdx: number,
    chainId: string,
    positionType: string,
    addValue: boolean,
) => {
    const httpGraphCacheServerDomain = GRAPHCACHE_URL;
    const positionStatsCacheEndpoint =
        httpGraphCacheServerDomain + '/position_stats?';

    const json = await fetch(
        positionStatsCacheEndpoint +
            new URLSearchParams({
                user: user.length === 40 ? '0x' + user : user,
                askTick: askTick.toString(),
                bidTick: bidTick.toString(),
                base: base.length === 40 ? '0x' + base : base,
                quote: quote.length === 40 ? '0x' + quote : quote,
                poolIdx: poolIdx.toString(),
                chainId: chainId,
                positionType: positionType,
                addValue: addValue.toString(),
            }),
    ).then((response) => response?.json());

    return json;
};

export const updatePositionStats = async (
    position: PositionIF,
): Promise<PositionIF> => {
    const updatedPosition = await getPositionStatsJsonAsync(
        position.user.length === 40 ? '0x' + position.user : position.user,
        position.askTick,
        position.bidTick,

        position.base.length === 40 ? '0x' + position.base : position.base,

        position.quote.length === 40 ? '0x' + position.quote : position.quote,
        position.poolIdx,
        position.chainId,
        position.positionType,
        true,
    )
        .then((json) => {
            const apy = json?.data.apy;
            const totalValueUSD = json?.data.totalValueUSD;
            const positionLiq = json?.data.positionLiq;
            const positionLiqBase = json?.data.positionLiqBase;
            const positionLiqBaseDecimalCorrected =
                json?.data.positionLiqBaseDecimalCorrected;
            const positionLiqQuote = json?.data.positionLiqQuote;
            const positionLiqQuoteDecimalCorrected =
                json?.data.positionLiqQuoteDecimalCorrected;

            const liqBaseNum = positionLiqBaseDecimalCorrected as number;
            const liqQuoteNum = positionLiqQuoteDecimalCorrected as number;

            const positionLiqBaseTruncated =
                getFormattedTokenBalance(liqBaseNum);

            const positionLiqQuoteTruncated =
                getFormattedTokenBalance(liqQuoteNum);

            return Object.assign({}, position, {
                apy: apy || 0,
                totalValueUSD: totalValueUSD,
                positionLiq: positionLiq,
                positionLiqBase: positionLiqBase,
                positionLiqQuote: positionLiqQuote,
                positionLiqBaseDecimalCorrected:
                    positionLiqBaseDecimalCorrected,
                positionLiqQuoteDecimalCorrected:
                    positionLiqQuoteDecimalCorrected,
                positionLiqBaseTruncated: positionLiqBaseTruncated,
                positionLiqQuoteTruncated: positionLiqQuoteTruncated,
            });
        })
        .catch(console.error);

    return updatedPosition || position;
};

export const updateApy = async (position: PositionIF): Promise<PositionIF> => {
    const httpGraphCacheServerDomain = GRAPHCACHE_URL;
    const positionApyCacheEndpoint =
        httpGraphCacheServerDomain + '/position_apy?';

    const updatedPosition = await fetch(
        positionApyCacheEndpoint +
            new URLSearchParams({
                user:
                    position.user.length === 40
                        ? '0x' + position.user
                        : position.user,
                askTick: position.askTick.toString(),
                bidTick: position.bidTick.toString(),
                base:
                    position.base.length === 40
                        ? '0x' + position.base
                        : position.base,
                quote:
                    position.quote.length === 40
                        ? '0x' + position.quote
                        : position.quote,
                poolIdx: position.poolIdx.toString(),
                chainId: position.chainId,
                // chainId: position.chainId,
                positionType: position.positionType,
                concise: 'true',
            }),
    )
        .then((response) => response?.json())
        .then((json) => {
            const apy = json?.data.results.apy;

            if (apy) {
                return Object.assign({}, position, { apy: apy });
            }
        })
        .catch(console.error);

    return updatedPosition || position;
};

export type PositionStatsFn = (
    user: string,
    askTick: number,
    bidTick: number,
    base: string,
    quote: string,
    poolIdx: number,
    chainId: string,
    positionType: string,
    addValue: boolean,
    time: number, // arbitrary number to cache for an amount of time
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<any>;

export function memoizePoolStats(): PositionStatsFn {
    return memoizeCacheQueryFn(getPositionStatsJsonAsync) as PositionStatsFn;
}

export type PositionUpdateFn = (
    position: PositionIF,
    time: number, // arbitrary number to cache for an amount of time
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<PositionIF>;

export function memoizePositionUpdate(): PositionUpdateFn {
    return memoizeCacheQueryFn(updatePositionStats) as PositionUpdateFn;
}
