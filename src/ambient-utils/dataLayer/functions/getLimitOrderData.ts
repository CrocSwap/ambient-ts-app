import {
    baseTokenForConcLiq,
    bigNumToFloat,
    CrocEnv,
    floatToBigNum,
    quoteTokenForConcLiq,
    tickToPrice,
    toDisplayPrice,
} from '@crocswap-libs/sdk';
import { LimitOrderIF, TokenIF, LimitOrderServerIF } from '../../types';
import { FetchAddrFn, FetchContractDetailsFn, TokenPriceFn } from '../../api';
import { SpotPriceFn } from './querySpotPrice';
import { Provider } from '@ethersproject/providers';
import { CACHE_UPDATE_FREQ_IN_MS } from '../../constants';
import { getMoneynessRankByAddr } from './getMoneynessRank';

export const getLimitOrderData = async (
    order: LimitOrderServerIF,
    tokensOnChain: TokenIF[],
    crocEnv: CrocEnv,
    provider: Provider,
    chainId: string,
    cachedFetchTokenPrice: TokenPriceFn,
    cachedQuerySpotPrice: SpotPriceFn,
    cachedTokenDetails: FetchContractDetailsFn,
    cachedEnsResolve: FetchAddrFn,
    skipENSFetch?: boolean,
): Promise<LimitOrderIF> => {
    if (!provider) throw Error('Can not proceed without an assigned provider');
    const newOrder = { ...order } as LimitOrderIF;

    const baseTokenAddress = order.base;
    const quoteTokenAddress = order.quote;

    // Fire off network queries async simultaneous up-front
    const poolPriceNonDisplay = cachedQuerySpotPrice(
        crocEnv,
        baseTokenAddress,
        quoteTokenAddress,
        chainId,
        Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS),
    );

    newOrder.ensResolution = skipENSFetch
        ? ''
        : (await cachedEnsResolve(order.user)) ?? '';

    const basePricePromise = cachedFetchTokenPrice(
        baseTokenAddress,
        chainId,
        crocEnv,
    );
    const quotePricePromise = cachedFetchTokenPrice(
        quoteTokenAddress,
        chainId,
        crocEnv,
    );

    const baseTokenLogoURI = tokensOnChain.find(
        (token) =>
            token.address.toLowerCase() === baseTokenAddress.toLowerCase(),
    )?.logoURI;
    const quoteTokenLogoURI = tokensOnChain.find(
        (token) =>
            token.address.toLowerCase() === quoteTokenAddress.toLowerCase(),
    )?.logoURI;

    const baseTokenListedDecimals = tokensOnChain.find(
        (token) =>
            token.address.toLowerCase() === baseTokenAddress.toLowerCase(),
    )?.decimals;
    const quoteTokenListedDecimals = tokensOnChain.find(
        (token) =>
            token.address.toLowerCase() === quoteTokenAddress.toLowerCase(),
    )?.decimals;

    const baseTokenListedSymbol = tokensOnChain.find(
        (token) =>
            token.address.toLowerCase() === baseTokenAddress.toLowerCase(),
    )?.symbol;
    const quoteTokenListedSymbol = tokensOnChain.find(
        (token) =>
            token.address.toLowerCase() === quoteTokenAddress.toLowerCase(),
    )?.symbol;

    const baseTokenName = tokensOnChain.find(
        (token) =>
            token.address.toLowerCase() === baseTokenAddress.toLowerCase(),
    )?.name;
    const quoteTokenName = tokensOnChain.find(
        (token) =>
            token.address.toLowerCase() === quoteTokenAddress.toLowerCase(),
    )?.name;

    const DEFAULT_DECIMALS = 18;
    const baseTokenDecimals = baseTokenListedDecimals
        ? baseTokenListedDecimals
        : (await cachedTokenDetails(provider, order.base, chainId))?.decimals ??
          DEFAULT_DECIMALS;
    const quoteTokenDecimals = quoteTokenListedDecimals
        ? quoteTokenListedDecimals
        : (await cachedTokenDetails(provider, order.quote, chainId))
              ?.decimals ?? DEFAULT_DECIMALS;

    newOrder.baseDecimals = baseTokenDecimals;
    newOrder.quoteDecimals = quoteTokenDecimals;

    newOrder.baseSymbol = baseTokenListedSymbol
        ? baseTokenListedSymbol
        : (await cachedTokenDetails(provider, order.base, chainId))?.symbol ??
          '';
    newOrder.quoteSymbol = quoteTokenListedSymbol
        ? quoteTokenListedSymbol
        : (await cachedTokenDetails(provider, order.quote, chainId))?.symbol ??
          '';

    newOrder.baseName = baseTokenName
        ? baseTokenName
        : (await cachedTokenDetails(provider, order.base, chainId))?.name ?? '';
    newOrder.quoteName = quoteTokenName
        ? quoteTokenName
        : (await cachedTokenDetails(provider, order.quote, chainId))?.name ??
          '';

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
        newOrder.claimableLiqBase = bigNumToFloat(
            baseTokenForConcLiq(
                tickToPrice(order.askTick),
                floatToBigNum(order.claimableLiq),
                tickToPrice(order.bidTick),
                tickToPrice(order.askTick),
            ),
        );
        newOrder.claimableLiqQuote = 0;
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
    newOrder.curentPoolPriceDisplayNum = poolPrice;

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

    newOrder.baseUsdPrice = basePrice?.usdPrice;
    newOrder.quoteUsdPrice = quotePrice?.usdPrice;

    newOrder.isBaseTokenMoneynessGreaterOrEqual =
        getMoneynessRankByAddr(baseTokenAddress) -
            getMoneynessRankByAddr(quoteTokenAddress) >=
        0;

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
