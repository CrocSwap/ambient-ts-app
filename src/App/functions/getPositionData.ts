import {
    baseTokenForConcLiq,
    bigNumToFloat,
    CrocEnv,
    floatToBigNum,
    quoteTokenForConcLiq,
    tickToPrice,
    toDisplayPrice,
} from '@crocswap-libs/sdk';
import { PositionIF, TokenIF } from '../../utils/interfaces/exports';
import { formatAmountOld } from '../../utils/numbers';
import { GRAPHCACHE_URL } from '../../constants';
import {
    memoizeQueryPoolGrowth,
    memoizeQuerySpotPrice,
} from './querySpotPrice';
import { PositionServerIF } from '../../utils/interfaces/PositionIF';
import { memoizeFetchContractDetails } from './fetchContractDetails';
import { memoizeFetchEnsAddress } from './fetchAddress';
import { memoizeTokenPrice } from './fetchTokenPrice';
import { getMainnetEquivalent } from '../../utils/data/testTokenMap';

const cachedQuerySpotPrice = memoizeQuerySpotPrice();
const cachedQueryPoolGrowth = memoizeQueryPoolGrowth();
const cachedTokenDetails = memoizeFetchContractDetails();
const cachedEnsResolve = memoizeFetchEnsAddress();
const cachedFetchTokenPrice = memoizeTokenPrice();

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

    // Fire off network queries async simultaneous up-front
    const poolPriceNonDisplay = cachedQuerySpotPrice(
        crocEnv,
        baseTokenAddress,
        quoteTokenAddress,
        chainId,
        lastBlockNumber,
    );

    const poolGrowthRate = cachedQueryPoolGrowth(
        crocEnv,
        baseTokenAddress,
        quoteTokenAddress,
        chainId,
        lastBlockNumber,
    );

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

    const ensRequest = cachedEnsResolve(
        (await crocEnv.context).provider,
        newPosition.user,
        '0x1',
    );

    const basePricedToken = getMainnetEquivalent(baseTokenAddress, chainId);
    const basePricePromise = cachedFetchTokenPrice(
        basePricedToken.token,
        basePricedToken.chainId,
    );
    const quotePricedToken = getMainnetEquivalent(quoteTokenAddress, chainId);
    const quotePricePromise = cachedFetchTokenPrice(
        quotePricedToken.token,
        quotePricedToken.chainId,
    );

    newPosition.ensResolution = (await ensRequest) ?? '';

    const poolPriceInTicks =
        Math.log(await poolPriceNonDisplay) / Math.log(1.0001);
    newPosition.poolPriceInTicks = poolPriceInTicks;

    const isPositionInRange =
        position.positionType === 'ambient' ||
        (position.bidTick <= poolPriceInTicks &&
            poolPriceInTicks <= position.askTick);

    newPosition.isPositionInRange = isPositionInRange;

    const DEFAULT_DECIMALS = 18;
    const baseTokenDecimals =
        (await baseMetadata)?.decimals ?? DEFAULT_DECIMALS;
    const quoteTokenDecimals =
        (await quoteMetadata)?.decimals ?? DEFAULT_DECIMALS;

    newPosition.baseDecimals = baseTokenDecimals;
    newPosition.quoteDecimals = quoteTokenDecimals;

    newPosition.baseSymbol = (await baseMetadata)?.symbol ?? '';
    newPosition.quoteSymbol = (await quoteMetadata)?.symbol ?? '';

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

    newPosition.bidTickPriceDecimalCorrected = lowerPriceDisplayInQuote;
    newPosition.bidTickInvPriceDecimalCorrected = lowerPriceDisplayInBase;
    newPosition.askTickPriceDecimalCorrected = upperPriceDisplayInQuote;
    newPosition.askTickInvPriceDecimalCorrected = upperPriceDisplayInBase;

    if (position.positionType == 'ambient') {
        newPosition.positionLiq =
            position.ambientSeeds * (1 + (await poolGrowthRate));

        newPosition.positionLiqBase =
            newPosition.positionLiq * Math.sqrt(await poolPriceNonDisplay);
        newPosition.positionLiqQuote =
            newPosition.positionLiq / Math.sqrt(await poolPriceNonDisplay);
    } else if (position.positionType == 'concentrated') {
        newPosition.positionLiq = position.concLiq;

        newPosition.positionLiqBase = bigNumToFloat(
            baseTokenForConcLiq(
                await poolPriceNonDisplay,
                floatToBigNum(position.concLiq),
                tickToPrice(position.bidTick),
                tickToPrice(position.askTick),
            ),
        );
        newPosition.positionLiqQuote = bigNumToFloat(
            quoteTokenForConcLiq(
                await poolPriceNonDisplay,
                floatToBigNum(position.concLiq),
                tickToPrice(position.bidTick),
                tickToPrice(position.askTick),
            ),
        );

        newPosition.feesLiqBase =
            position.rewardLiq * Math.sqrt(await poolPriceNonDisplay);
        newPosition.feesLiqQuote =
            position.rewardLiq / Math.sqrt(await poolPriceNonDisplay);
        newPosition.feesLiqBaseDecimalCorrected =
            newPosition.feesLiqBase / Math.pow(10, baseTokenDecimals);
        newPosition.feesLiqQuoteDecimalCorrected =
            newPosition.feesLiqQuote / Math.pow(10, quoteTokenDecimals);
    }

    newPosition.positionLiqBaseDecimalCorrected =
        newPosition.positionLiqBase / Math.pow(10, baseTokenDecimals);
    newPosition.positionLiqQuoteDecimalCorrected =
        newPosition.positionLiqQuote / Math.pow(10, quoteTokenDecimals);

    const liqBaseNum = newPosition.positionLiqBaseDecimalCorrected;
    newPosition.positionLiqBaseTruncated =
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

    const liqQuoteNum = newPosition.positionLiqQuoteDecimalCorrected;
    newPosition.positionLiqQuoteTruncated =
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

    const basePrice = await basePricePromise;
    const quotePrice = await quotePricePromise;
    const poolPrice = toDisplayPrice(
        await poolPriceNonDisplay,
        baseTokenDecimals,
        quoteTokenDecimals,
    );

    if (quotePrice && basePrice) {
        newPosition.totalValueUSD =
            quotePrice.usdPrice * newPosition.positionLiqQuoteDecimalCorrected +
            basePrice.usdPrice * newPosition.positionLiqBaseDecimalCorrected;
    } else if (basePrice) {
        const quotePrice = basePrice.usdPrice * poolPrice;
        newPosition.totalValueUSD =
            quotePrice * newPosition.positionLiqQuoteDecimalCorrected +
            basePrice.usdPrice * newPosition.positionLiqBaseDecimalCorrected;
    } else if (quotePrice) {
        const basePrice = quotePrice.usdPrice / poolPrice;
        newPosition.totalValueUSD =
            basePrice * newPosition.positionLiqBaseDecimalCorrected +
            quotePrice.usdPrice * newPosition.positionLiqQuoteDecimalCorrected;
    } else {
        newPosition.totalValueUSD = 0.0;
    }

    return newPosition;
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

export type PositionUpdateFn = (
    position: PositionIF,
    time: number, // arbitrary number to cache for an amount of time
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<PositionIF>;
