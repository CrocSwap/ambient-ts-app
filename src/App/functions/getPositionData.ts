import {
    CHAIN_SPECS,
    CrocEnv,
    tickToPrice,
    toDisplayPrice,
} from '@crocswap-libs/sdk';
import { PositionIF, TokenIF } from '../../utils/interfaces/exports';
import { formatAmountOld } from '../../utils/numbers';
import { memoizeCacheQueryFn } from './memoizePromiseFn';
import { GRAPHCACHE_URL } from '../../constants';
import { memoizeQuerySpotPrice } from './querySpotPrice';
import { PositionServerIF } from '../../utils/interfaces/PositionIF';
import { memoizeFetchContractDetails } from './fetchContractDetails';
import { memoizeFetchEnsAddress } from './fetchAddress';

const cachedQuerySpotPrice = memoizeQuerySpotPrice();
const cachedTokenDetails = memoizeFetchContractDetails();
const cachedEnsResolve = memoizeFetchEnsAddress();

export const getPositionData = async (
    position: PositionServerIF,
    tokensOnChain: TokenIF[],
    crocEnv: CrocEnv,
    chainId: string,
    lastBlockNumber: number,
): Promise<PositionIF> => {
    const newPosition = { ...position } as any as PositionIF;

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

    const baseMetadata = cachedTokenDetails(
        (await crocEnv.context).provider,
        position.base,
        chainId,
    );
    const quoteMetadata = cachedTokenDetails(
        (await crocEnv.context).provider,
        position.quote,
        chainId,
    );

    const DEFAULT_DECIMALS = 18;
    const baseTokenDecimals =
        (await baseMetadata)?.decimals ?? DEFAULT_DECIMALS;
    const quoteTokenDecimals =
        (await quoteMetadata)?.decimals ?? DEFAULT_DECIMALS;

    newPosition.baseDecimals = baseTokenDecimals;
    newPosition.quoteDecimals = quoteTokenDecimals;

    newPosition.baseSymbol = (await baseMetadata)?.symbol ?? '';
    newPosition.quoteSymbol = (await quoteMetadata)?.symbol ?? '';

    newPosition.ensResolution =
        (await cachedEnsResolve(
            (
                await crocEnv.context
            ).provider,
            newPosition.user,
            '0x1',
        )) ?? '';

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

    // TODO (#1569): we should be re-using a token formatting function here and below
    newPosition.lowRangeShortDisplayInBase =
        lowerPriceDisplayInBase < 0.0001
            ? lowerPriceDisplayInBase.toExponential(2)
            : lowerPriceDisplayInBase < 2
            ? lowerPriceDisplayInBase.toPrecision(3)
            : lowerPriceDisplayInBase >= 1000000
            ? lowerPriceDisplayInBase.toExponential(2)
            : lowerPriceDisplayInBase.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
              });

    newPosition.lowRangeShortDisplayInQuote =
        lowerPriceDisplayInQuote < 0.0001
            ? lowerPriceDisplayInQuote.toExponential(2)
            : lowerPriceDisplayInQuote < 2
            ? lowerPriceDisplayInQuote.toPrecision(3)
            : lowerPriceDisplayInQuote >= 1000000
            ? lowerPriceDisplayInQuote.toExponential(2)
            : lowerPriceDisplayInQuote.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
              });

    newPosition.highRangeShortDisplayInBase =
        upperPriceDisplayInBase < 0.0001
            ? upperPriceDisplayInBase.toExponential(2)
            : upperPriceDisplayInBase < 2
            ? upperPriceDisplayInBase.toPrecision(3)
            : upperPriceDisplayInBase >= 1000000
            ? upperPriceDisplayInBase.toExponential(2)
            : upperPriceDisplayInBase.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
              });

    newPosition.highRangeShortDisplayInQuote =
        upperPriceDisplayInQuote < 0.0001
            ? upperPriceDisplayInQuote.toExponential(2)
            : upperPriceDisplayInQuote < 2
            ? upperPriceDisplayInQuote.toPrecision(3)
            : upperPriceDisplayInQuote >= 1000000
            ? upperPriceDisplayInQuote.toExponential(2)
            : upperPriceDisplayInQuote.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
              });

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
        newPosition.lowRangeDisplayInBase =
            lowerPriceDisplayInBase < 0.0001
                ? lowerPriceDisplayInBase.toExponential(2)
                : lowerPriceDisplayInBase < 2
                ? lowerPriceDisplayInBase.toPrecision(3)
                : lowerPriceDisplayInBase >= 1000000
                ? lowerPriceDisplayInBase.toExponential(2)
                : lowerPriceDisplayInBase.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  });
        newPosition.highRangeDisplayInBase =
            upperPriceDisplayInBase < 0.0001
                ? upperPriceDisplayInBase.toExponential(2)
                : upperPriceDisplayInBase < 2
                ? upperPriceDisplayInBase.toPrecision(3)
                : upperPriceDisplayInBase >= 1000000
                ? upperPriceDisplayInBase.toExponential(2)
                : upperPriceDisplayInBase.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  });
    }

    if (position.positionType !== 'ambient') {
        newPosition.lowRangeDisplayInQuote =
            lowerPriceDisplayInQuote < 0.0001
                ? lowerPriceDisplayInQuote.toExponential(2)
                : lowerPriceDisplayInQuote < 2
                ? lowerPriceDisplayInQuote.toPrecision(3)
                : lowerPriceDisplayInQuote >= 1000000
                ? lowerPriceDisplayInQuote.toExponential(2)
                : lowerPriceDisplayInQuote.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  });
        newPosition.highRangeDisplayInQuote =
            upperPriceDisplayInQuote < 0.0001
                ? upperPriceDisplayInQuote.toExponential(2)
                : upperPriceDisplayInQuote < 2
                ? upperPriceDisplayInQuote.toPrecision(3)
                : upperPriceDisplayInQuote >= 1000000
                ? upperPriceDisplayInQuote.toExponential(2)
                : upperPriceDisplayInQuote.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  });
    }

    if (position.positionLiqBaseDecimalCorrected) {
        const liqBaseNum = position.positionLiqBaseDecimalCorrected;

        const baseLiqDisplayTruncated =
            liqBaseNum === 0
                ? '0'
                : liqBaseNum < 0.0001
                ? liqBaseNum.toExponential(2)
                : liqBaseNum < 2
                ? liqBaseNum.toPrecision(3)
                : liqBaseNum >= 10000
                ? formatAmountOld(liqBaseNum)
                : liqBaseNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  });

        newPosition.positionLiqBaseTruncated = baseLiqDisplayTruncated;
    }
    if (position.positionLiqQuoteDecimalCorrected) {
        const liqQuoteNum = position.positionLiqQuoteDecimalCorrected;

        const quoteLiqDisplayTruncated =
            liqQuoteNum === 0
                ? '0'
                : liqQuoteNum < 0.0001
                ? liqQuoteNum.toExponential(2)
                : liqQuoteNum < 2
                ? liqQuoteNum.toPrecision(3)
                : liqQuoteNum >= 10000
                ? formatAmountOld(liqQuoteNum)
                : liqQuoteNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  });
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

            const liqBaseNum = positionLiqBaseDecimalCorrected;
            const liqQuoteNum = positionLiqQuoteDecimalCorrected;

            // TODO (#1569): token value formatting
            const positionLiqBaseTruncated = !liqBaseNum
                ? '0'
                : liqBaseNum < 0.0001
                ? liqBaseNum.toExponential(2)
                : liqBaseNum < 2
                ? liqBaseNum.toPrecision(3)
                : liqBaseNum >= 10000
                ? formatAmountOld(liqBaseNum)
                : liqBaseNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  });

            const positionLiqQuoteTruncated = !liqQuoteNum
                ? '0'
                : liqQuoteNum < 0.0001
                ? liqQuoteNum.toExponential(2)
                : liqQuoteNum < 2
                ? liqQuoteNum.toPrecision(3)
                : liqQuoteNum >= 10000
                ? formatAmountOld(liqQuoteNum)
                : liqQuoteNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  });

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
