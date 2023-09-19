import {
    baseTokenForConcLiq,
    bigNumToFloat,
    CrocEnv,
    floatToBigNum,
    quoteTokenForConcLiq,
    tickToPrice,
    toDisplayPrice,
} from '@crocswap-libs/sdk';
import { getMainnetAddress } from '../../utils/functions/getMainnetAddress';
import { LimitOrderIF, TokenIF } from '../../utils/interfaces/exports';
import { LimitOrderServerIF } from '../../utils/interfaces/LimitOrderIF';
import { supportedNetworks } from '../../utils/networks';
import { FetchAddrFn } from './fetchAddress';
import { FetchContractDetailsFn } from './fetchContractDetails';
import { TokenPriceFn } from './fetchTokenPrice';
import { SpotPriceFn } from './querySpotPrice';

export const getLimitOrderData = async (
    order: LimitOrderServerIF,
    tokensOnChain: TokenIF[],
    crocEnv: CrocEnv,
    chainId: string,
    lastBlockNumber: number,
    cachedFetchTokenPrice: TokenPriceFn,
    cachedQuerySpotPrice: SpotPriceFn,
    cachedTokenDetails: FetchContractDetailsFn,
    cachedEnsResolve: FetchAddrFn,
): Promise<LimitOrderIF> => {
    const newOrder = { ...order } as LimitOrderIF;

    const baseTokenAddress = order.base;
    const quoteTokenAddress = order.quote;

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
        order.base,
        chainId,
    );
    const quoteMetadata = cachedTokenDetails(
        (await crocEnv.context).provider,
        order.quote,
        chainId,
    );

    const ensRequest = cachedEnsResolve(
        (await crocEnv.context).provider,
        order.user,
        '0x1',
    );

    newOrder.ensResolution = (await ensRequest) ?? '';

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

    const DEFAULT_DECIMALS = 18;
    const baseTokenDecimals =
        (await baseMetadata)?.decimals ?? DEFAULT_DECIMALS;
    const quoteTokenDecimals =
        (await quoteMetadata)?.decimals ?? DEFAULT_DECIMALS;

    newOrder.baseDecimals = baseTokenDecimals;
    newOrder.quoteDecimals = quoteTokenDecimals;

    newOrder.baseSymbol = (await baseMetadata)?.symbol ?? '';
    newOrder.quoteSymbol = (await quoteMetadata)?.symbol ?? '';

    newOrder.baseName = (await baseMetadata)?.name ?? '';
    newOrder.quoteName = (await quoteMetadata)?.name ?? '';

    const baseTokenLogoURI = tokensOnChain.find(
        (token) =>
            token.address.toLowerCase() === baseTokenAddress.toLowerCase(),
    )?.logoURI;
    const quoteTokenLogoURI = tokensOnChain.find(
        (token) =>
            token.address.toLowerCase() === quoteTokenAddress.toLowerCase(),
    )?.logoURI;

    newOrder.baseTokenLogoURI = baseTokenLogoURI ?? '';
    newOrder.quoteTokenLogoURI = quoteTokenLogoURI ?? '';

    const lowerPriceNonDisplay = tickToPrice(order.bidTick);
    const upperPriceNonDisplay = tickToPrice(order.askTick);

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

    newOrder.bidTickPriceDecimalCorrected = lowerPriceDisplayInQuote;
    newOrder.bidTickInvPriceDecimalCorrected = lowerPriceDisplayInBase;
    newOrder.askTickPriceDecimalCorrected = upperPriceDisplayInQuote;
    newOrder.askTickInvPriceDecimalCorrected = upperPriceDisplayInBase;

    newOrder.positionLiq = order.concLiq;
    newOrder.positionLiqBase = bigNumToFloat(
        baseTokenForConcLiq(
            await poolPriceNonDisplay,
            floatToBigNum(order.concLiq),
            tickToPrice(order.bidTick),
            tickToPrice(order.askTick),
        ),
    );

    newOrder.positionLiqQuote = bigNumToFloat(
        quoteTokenForConcLiq(
            await poolPriceNonDisplay,
            floatToBigNum(order.concLiq),
            tickToPrice(order.bidTick),
            tickToPrice(order.askTick),
        ),
    );
    newOrder.originalPositionLiqBase = bigNumToFloat(
        baseTokenForConcLiq(
            !order.isBid
                ? tickToPrice(order.bidTick - 1)
                : tickToPrice(order.askTick + 1),
            floatToBigNum(order.concLiq + order.claimableLiq),
            tickToPrice(order.bidTick),
            tickToPrice(order.askTick),
        ),
    );
    newOrder.originalPositionLiqQuote = bigNumToFloat(
        quoteTokenForConcLiq(
            !order.isBid
                ? tickToPrice(order.bidTick - 1)
                : tickToPrice(order.askTick + 1),
            floatToBigNum(order.concLiq + order.claimableLiq),
            tickToPrice(order.bidTick),
            tickToPrice(order.askTick),
        ),
    );
    newOrder.expectedPositionLiqBase = bigNumToFloat(
        baseTokenForConcLiq(
            order.isBid
                ? tickToPrice(order.bidTick - 1)
                : tickToPrice(order.askTick + 1),
            floatToBigNum(order.concLiq + order.claimableLiq),
            tickToPrice(order.bidTick),
            tickToPrice(order.askTick),
        ),
    );
    newOrder.expectedPositionLiqQuote = bigNumToFloat(
        quoteTokenForConcLiq(
            order.isBid
                ? tickToPrice(order.bidTick - 1)
                : tickToPrice(order.askTick + 1),
            floatToBigNum(order.concLiq + order.claimableLiq),
            tickToPrice(order.bidTick),
            tickToPrice(order.askTick),
        ),
    );

    if (order.isBid) {
        newOrder.claimableLiqQuote = bigNumToFloat(
            quoteTokenForConcLiq(
                tickToPrice(order.bidTick),
                floatToBigNum(order.claimableLiq),
                tickToPrice(order.bidTick),
                tickToPrice(order.askTick),
            ),
        );
        newOrder.claimableLiqBase = 0;
    } else {
        (newOrder.claimableLiqBase = bigNumToFloat(
            baseTokenForConcLiq(
                tickToPrice(order.askTick),
                floatToBigNum(order.claimableLiq),
                tickToPrice(order.bidTick),
                tickToPrice(order.askTick),
            ),
        )),
            (newOrder.claimableLiqQuote = 0);
    }

    if (newOrder.crossTime > 0 || newOrder.claimableLiq > 0) {
        newOrder.claimableLiqPivotTimes = newOrder.pivotTime;
    } else {
        newOrder.claimableLiqPivotTimes = 0;
    }

    newOrder.positionLiqBaseDecimalCorrected =
        newOrder.positionLiqBase / Math.pow(10, baseTokenDecimals);
    newOrder.positionLiqQuoteDecimalCorrected =
        newOrder.positionLiqQuote / Math.pow(10, quoteTokenDecimals);

    newOrder.originalPositionLiqBaseDecimalCorrected =
        newOrder.originalPositionLiqBase / Math.pow(10, baseTokenDecimals);
    newOrder.originalPositionLiqQuoteDecimalCorrected =
        newOrder.originalPositionLiqQuote / Math.pow(10, quoteTokenDecimals);

    newOrder.expectedPositionLiqBaseDecimalCorrected =
        newOrder.expectedPositionLiqBase / Math.pow(10, baseTokenDecimals);
    newOrder.expectedPositionLiqQuoteDecimalCorrected =
        newOrder.expectedPositionLiqQuote / Math.pow(10, quoteTokenDecimals);

    newOrder.claimableLiqBaseDecimalCorrected =
        newOrder.claimableLiqBase / Math.pow(10, baseTokenDecimals);
    newOrder.claimableLiqQuoteDecimalCorrected =
        newOrder.claimableLiqQuote / Math.pow(10, quoteTokenDecimals);

    const basePrice = await basePricePromise;
    const quotePrice = await quotePricePromise;
    const poolPrice = toDisplayPrice(
        await poolPriceNonDisplay,
        baseTokenDecimals,
        quoteTokenDecimals,
    );

    newOrder.limitPrice = order.isBid
        ? tickToPrice(order.bidTick)
        : tickToPrice(order.askTick);
    newOrder.invLimitPrice = 1 / newOrder.limitPrice;
    newOrder.limitPriceDecimalCorrected = toDisplayPrice(
        newOrder.limitPrice,
        baseTokenDecimals,
        quoteTokenDecimals,
    );
    newOrder.invLimitPriceDecimalCorrected =
        1 / newOrder.limitPriceDecimalCorrected;

    const totalBaseLiq =
        newOrder.positionLiqBaseDecimalCorrected +
        newOrder.claimableLiqBaseDecimalCorrected;
    const totalQuoteLiq =
        newOrder.positionLiqQuoteDecimalCorrected +
        newOrder.claimableLiqQuoteDecimalCorrected;

    if (quotePrice && basePrice) {
        newOrder.totalValueUSD =
            quotePrice.usdPrice * totalQuoteLiq +
            basePrice.usdPrice * totalBaseLiq;
    } else if (basePrice) {
        const quotePrice = basePrice.usdPrice * poolPrice;
        newOrder.totalValueUSD =
            quotePrice * totalQuoteLiq + basePrice.usdPrice * totalBaseLiq;
    } else if (quotePrice) {
        const basePrice = quotePrice.usdPrice / poolPrice;
        newOrder.totalValueUSD =
            basePrice * totalBaseLiq + quotePrice.usdPrice * totalQuoteLiq;
    } else {
        newOrder.totalValueUSD = 0.0;
    }

    return newOrder;
};
