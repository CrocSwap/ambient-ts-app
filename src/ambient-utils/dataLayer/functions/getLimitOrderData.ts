import {
    baseTokenForConcLiq,
    bigIntToFloat,
    CrocEnv,
    floatToBigInt,
    quoteTokenForConcLiq,
    tickToPrice,
    toDisplayPrice,
} from '@crocswap-libs/sdk';
import { Provider } from 'ethers';
import { FetchAddrFn, FetchContractDetailsFn, TokenPriceFn } from '../../api';
import { CACHE_UPDATE_FREQ_IN_MS } from '../../constants';
import { LimitOrderIF, LimitOrderServerIF, TokenIF } from '../../types';
import { getMoneynessRankByAddr } from './getMoneynessRank';
import { getPositionHash } from './getPositionHash';
import { SpotPriceFn } from './querySpotPrice';

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
): Promise<LimitOrderIF> => {
    if (!provider) throw Error('Can not proceed without an assigned provider');
    if (!crocEnv || (await crocEnv.context).chain.chainId !== chainId)
        throw Error('chainId mismatch with crocEnv');
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

    newOrder.ensResolution = (await cachedEnsResolve(order.user)) ?? '';

    const basePricePromise = cachedFetchTokenPrice(baseTokenAddress, chainId);
    const quotePricePromise = cachedFetchTokenPrice(quoteTokenAddress, chainId);

    const posHash = getPositionHash(undefined, {
        isPositionTypeAmbient: false,
        user: order.user ?? '',
        baseAddress: order.base ?? '',
        quoteAddress: order.quote ?? '',
        poolIdx: order.poolIdx ?? 0,
        bidTick: order.bidTick ?? 0,
        askTick: order.askTick ?? 0,
    });

    newOrder.positionHash = posHash;

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
        : ((await cachedTokenDetails(provider, order.base, chainId))
              ?.decimals ?? DEFAULT_DECIMALS);
    const quoteTokenDecimals = quoteTokenListedDecimals
        ? quoteTokenListedDecimals
        : ((await cachedTokenDetails(provider, order.quote, chainId))
              ?.decimals ?? DEFAULT_DECIMALS);

    newOrder.baseDecimals = baseTokenDecimals;
    newOrder.quoteDecimals = quoteTokenDecimals;

    newOrder.baseSymbol = baseTokenListedSymbol
        ? baseTokenListedSymbol
        : ((await cachedTokenDetails(provider, order.base, chainId))?.symbol ??
          '');
    newOrder.quoteSymbol = quoteTokenListedSymbol
        ? quoteTokenListedSymbol
        : ((await cachedTokenDetails(provider, order.quote, chainId))?.symbol ??
          '');

    newOrder.baseName = baseTokenName
        ? baseTokenName
        : ((await cachedTokenDetails(provider, order.base, chainId))?.name ??
          '');
    newOrder.quoteName = quoteTokenName
        ? quoteTokenName
        : ((await cachedTokenDetails(provider, order.quote, chainId))?.name ??
          '');

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
    newOrder.positionLiqBase = bigIntToFloat(
        baseTokenForConcLiq(
            await poolPriceNonDisplay,
            floatToBigInt(order.concLiq),
            tickToPrice(order.bidTick),
            tickToPrice(order.askTick),
        ),
    );

    newOrder.positionLiqQuote = bigIntToFloat(
        quoteTokenForConcLiq(
            await poolPriceNonDisplay,
            floatToBigInt(order.concLiq),
            tickToPrice(order.bidTick),
            tickToPrice(order.askTick),
        ),
    );
    newOrder.originalPositionLiqBase = bigIntToFloat(
        baseTokenForConcLiq(
            !order.isBid
                ? tickToPrice(order.bidTick - 1)
                : tickToPrice(order.askTick + 1),
            floatToBigInt(order.concLiq + order.claimableLiq),
            tickToPrice(order.bidTick),
            tickToPrice(order.askTick),
        ),
    );
    newOrder.originalPositionLiqQuote = bigIntToFloat(
        quoteTokenForConcLiq(
            !order.isBid
                ? tickToPrice(order.bidTick - 1)
                : tickToPrice(order.askTick + 1),
            floatToBigInt(order.concLiq + order.claimableLiq),
            tickToPrice(order.bidTick),
            tickToPrice(order.askTick),
        ),
    );
    newOrder.expectedPositionLiqBase = bigIntToFloat(
        baseTokenForConcLiq(
            order.isBid
                ? tickToPrice(order.bidTick - 1)
                : tickToPrice(order.askTick + 1),
            floatToBigInt(order.concLiq + order.claimableLiq),
            tickToPrice(order.bidTick),
            tickToPrice(order.askTick),
        ),
    );
    newOrder.expectedPositionLiqQuote = bigIntToFloat(
        quoteTokenForConcLiq(
            order.isBid
                ? tickToPrice(order.bidTick - 1)
                : tickToPrice(order.askTick + 1),
            floatToBigInt(order.concLiq + order.claimableLiq),
            tickToPrice(order.bidTick),
            tickToPrice(order.askTick),
        ),
    );

    if (order.isBid) {
        newOrder.claimableLiqQuote = bigIntToFloat(
            quoteTokenForConcLiq(
                tickToPrice(order.bidTick),
                floatToBigInt(order.claimableLiq),
                tickToPrice(order.bidTick),
                tickToPrice(order.askTick),
            ),
        );
        newOrder.claimableLiqBase = 0;
    } else {
        newOrder.claimableLiqBase = bigIntToFloat(
            baseTokenForConcLiq(
                tickToPrice(order.askTick),
                floatToBigInt(order.claimableLiq),
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

export function filterLimitArray(arr: LimitOrderIF[]) {
    // Step 1: Create a set of positionHash values where claimableLiq is 0
    const positionHashes = new Set();
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].claimableLiq !== 0) {
            positionHashes.add(arr[i].positionHash);
        }
    }

    // Step 2: Filter the array based on the conditions
    const filteredArray = arr.filter((item: LimitOrderIF) => {
        // Include items where claimableLiq is not 0
        if (item.claimableLiq !== 0) {
            return true;
        }

        // Include items where positionHash does not match a non-zero claimableLiq item
        if (!positionHashes.has(item.positionHash)) {
            return true;
        }

        // Exclude items that do not meet the above conditions
        return false;
    });

    return filteredArray;
}
