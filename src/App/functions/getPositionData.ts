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
import { PositionServerIF } from '../../utils/interfaces/PositionIF';
import { FetchAddrFn } from './fetchAddress';
import { FetchContractDetailsFn } from './fetchContractDetails';
import { TokenPriceFn } from './fetchTokenPrice';
import { SpotPriceFn } from './querySpotPrice';
import { getFormattedNumber } from './getFormattedNumber';
import { getMainnetAddress } from '../../utils/functions/getMainnetAddress';
import { supportedNetworks } from '../../utils/networks';

export const getPositionData = async (
    position: PositionServerIF,
    tokensOnChain: TokenIF[],
    crocEnv: CrocEnv,
    chainId: string,
    lastBlockNumber: number,
    cachedFetchTokenPrice: TokenPriceFn,
    cachedQuerySpotPrice: SpotPriceFn,
    cachedTokenDetails: FetchContractDetailsFn,
    cachedEnsResolve: FetchAddrFn,
): Promise<PositionIF> => {
    const newPosition = { ...position } as PositionIF;

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

    const ensRequest = cachedEnsResolve(newPosition.user);

    const basePricedToken = getMainnetAddress(
        baseTokenAddress,
        supportedNetworks[chainId],
    );
    const basePricePromise = cachedFetchTokenPrice(basePricedToken, chainId);
    const quotePricedToken = getMainnetAddress(
        quoteTokenAddress,
        supportedNetworks[chainId],
    );
    const quotePricePromise = cachedFetchTokenPrice(quotePricedToken, chainId);

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

    newPosition.baseName = (await baseMetadata)?.name ?? '';
    newPosition.quoteName = (await quoteMetadata)?.name ?? '';

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

    newPosition.lowRangeDisplayInBase = getFormattedNumber({
        value: lowerPriceDisplayInBase,
    });
    newPosition.highRangeDisplayInBase = getFormattedNumber({
        value: upperPriceDisplayInBase,
    });

    newPosition.lowRangeDisplayInQuote = getFormattedNumber({
        value: lowerPriceDisplayInQuote,
    });
    newPosition.highRangeDisplayInQuote = getFormattedNumber({
        value: upperPriceDisplayInQuote,
    });

    newPosition.lowRangeShortDisplayInBase = getFormattedNumber({
        value: lowerPriceDisplayInBase,
        minFracDigits: 0,
        maxFracDigits: 0,
    });
    newPosition.lowRangeShortDisplayInQuote = getFormattedNumber({
        value: lowerPriceDisplayInQuote,
        minFracDigits: 0,
        maxFracDigits: 0,
    });

    newPosition.highRangeShortDisplayInBase = getFormattedNumber({
        value: upperPriceDisplayInBase,
        minFracDigits: 0,
        maxFracDigits: 0,
    });
    newPosition.highRangeShortDisplayInQuote = getFormattedNumber({
        value: upperPriceDisplayInQuote,
        minFracDigits: 0,
        maxFracDigits: 0,
    });

    newPosition.bidTickPriceDecimalCorrected = lowerPriceDisplayInQuote;
    newPosition.bidTickInvPriceDecimalCorrected = lowerPriceDisplayInBase;
    newPosition.askTickPriceDecimalCorrected = upperPriceDisplayInQuote;
    newPosition.askTickInvPriceDecimalCorrected = upperPriceDisplayInBase;

    if (position.positionType == 'ambient') {
        newPosition.positionLiq = position.ambientLiq;

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
    newPosition.positionLiqBaseTruncated = getFormattedNumber({
        value: liqBaseNum,
        zeroDisplay: '0',
    });

    const liqQuoteNum = newPosition.positionLiqQuoteDecimalCorrected;
    newPosition.positionLiqQuoteTruncated = getFormattedNumber({
        value: liqQuoteNum,
        zeroDisplay: '0',
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

    newPosition.apy = position.aprEst * 100;

    return newPosition;
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
