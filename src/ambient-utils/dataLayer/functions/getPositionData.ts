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
import { FetchContractDetailsFn, TokenPriceFn } from '../../api';
import { CACHE_UPDATE_FREQ_IN_MS } from '../../constants';
import {
    LimitOrderIF,
    PoolIF,
    PositionIF,
    PositionServerIF,
    TokenIF,
} from '../../types';
import { getFormattedNumber } from './getFormattedNumber';
import { getMoneynessRankByAddr } from './getMoneynessRank';
import { getPositionHash } from './getPositionHash';
import { SpotPriceFn } from './querySpotPrice';

export const getPositionData = async (
    position: PositionServerIF,
    tokensOnChain: TokenIF[],
    crocEnv: CrocEnv,
    provider: Provider,
    chainId: string,
    analyticsPoolList: PoolIF[] | undefined,
    cachedFetchTokenPrice: TokenPriceFn,
    cachedQuerySpotPrice: SpotPriceFn,
    cachedTokenDetails: FetchContractDetailsFn,
    forceOnchainLiqUpdate?: boolean,
): Promise<PositionIF> => {
    if (!crocEnv || (await crocEnv.context).chain.chainId !== chainId)
        throw Error('chainId mismatch with crocEnv');

    const newPosition = {
        serverPositionId: position.positionId,
        ...position,
    } as PositionIF;

    const baseTokenAddress =
        position.base.length === 40 ? '0x' + position.base : position.base;
    const quoteTokenAddress =
        position.quote.length === 40 ? '0x' + position.quote : position.quote;

    const poolOnAnalyticsPoolList = analyticsPoolList?.find(
        (poolListEntry: PoolIF) =>
            poolListEntry.base.toLowerCase() ===
                baseTokenAddress.toLowerCase() &&
            poolListEntry.quote.toLowerCase() ===
                quoteTokenAddress.toLowerCase(),
    );

    const isLowRPCMode = chainId === '0x279f'; // monad testnet

    const poolPriceNonDisplay =
        isLowRPCMode && poolOnAnalyticsPoolList?.lastPriceSwap
            ? poolOnAnalyticsPoolList.lastPriceSwap
            : await cachedQuerySpotPrice(
                  crocEnv,
                  baseTokenAddress,
                  quoteTokenAddress,
                  chainId,
                  Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS),
              );

    const basePrice = poolOnAnalyticsPoolList?.baseUsdPrice
        ? poolOnAnalyticsPoolList.baseUsdPrice
        : (await cachedFetchTokenPrice(baseTokenAddress, chainId))?.usdPrice;
    const quotePrice = poolOnAnalyticsPoolList?.quoteUsdPrice
        ? poolOnAnalyticsPoolList.quoteUsdPrice
        : (await cachedFetchTokenPrice(quoteTokenAddress, chainId))?.usdPrice;

    const baseTokenName = tokensOnChain.find(
        (token) =>
            token.address.toLowerCase() === baseTokenAddress.toLowerCase(),
    )?.name;
    const quoteTokenName = tokensOnChain.find(
        (token) =>
            token.address.toLowerCase() === quoteTokenAddress.toLowerCase(),
    )?.name;

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

    const DEFAULT_DECIMALS = 18;
    const baseTokenDecimals = baseTokenListedDecimals
        ? baseTokenListedDecimals
        : ((await cachedTokenDetails(provider, position.base, chainId))
              ?.decimals ?? DEFAULT_DECIMALS);
    const quoteTokenDecimals = quoteTokenListedDecimals
        ? quoteTokenListedDecimals
        : ((await cachedTokenDetails(provider, position.quote, chainId))
              ?.decimals ?? DEFAULT_DECIMALS);

    const poolPriceInTicks = Math.log(poolPriceNonDisplay) / Math.log(1.0001);
    newPosition.poolPriceInTicks = poolPriceInTicks;

    const isPositionInRange =
        position.positionType === 'ambient' ||
        (position.bidTick <= poolPriceInTicks &&
            poolPriceInTicks <= position.askTick);

    newPosition.isPositionInRange = isPositionInRange;

    newPosition.baseDecimals = baseTokenDecimals;
    newPosition.quoteDecimals = quoteTokenDecimals;

    newPosition.baseSymbol = baseTokenListedSymbol
        ? baseTokenListedSymbol
        : ((await cachedTokenDetails(provider, position.base, chainId))
              ?.symbol ?? '');
    newPosition.quoteSymbol = quoteTokenListedSymbol
        ? quoteTokenListedSymbol
        : ((await cachedTokenDetails(provider, position.quote, chainId))
              ?.symbol ?? '');

    newPosition.baseName = baseTokenName
        ? baseTokenName
        : ((await cachedTokenDetails(provider, position.base, chainId))?.name ??
          '');
    newPosition.quoteName = quoteTokenName
        ? quoteTokenName
        : ((await cachedTokenDetails(provider, position.quote, chainId))
              ?.name ?? '');

    const lowerPriceNonDisplay = tickToPrice(position.bidTick);
    const upperPriceNonDisplay = tickToPrice(position.askTick);

    newPosition.isBaseTokenMoneynessGreaterOrEqual =
        getMoneynessRankByAddr(baseTokenAddress, position.chainId) -
            getMoneynessRankByAddr(quoteTokenAddress, position.chainId) >=
        0;

    newPosition.baseUsdPrice = basePrice;
    newPosition.quoteUsdPrice = quotePrice;

    const posHash = getPositionHash(undefined, {
        isPositionTypeAmbient: position.positionType === 'ambient',
        user: position.user,
        baseAddress: position.base,
        quoteAddress: position.quote,
        poolIdx: position.poolIdx,
        bidTick: position.bidTick,
        askTick: position.askTick,
    });

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

    // uncomment below to test SDK call fallback when server is down
    // newPosition.liqRefreshTime = 0;

    if (position.positionType == 'ambient') {
        if (newPosition.liqRefreshTime === 0 || forceOnchainLiqUpdate) {
            const pos = crocEnv.positions(
                position.base,
                position.quote,
                position.user,
            );
            const liqBigNum = (await pos.queryAmbientPos()).liq;
            const liqNum = bigIntToFloat(liqBigNum);
            newPosition.positionLiq = liqNum;
        } else {
            newPosition.positionLiq = position.ambientLiq;
        }
        newPosition.positionLiqBase =
            newPosition.positionLiq * Math.sqrt(poolPriceNonDisplay);
        newPosition.positionLiqQuote =
            newPosition.positionLiq / Math.sqrt(poolPriceNonDisplay);
    } else if (position.positionType == 'concentrated') {
        if (
            newPosition.liqRefreshTime === 0 ||
            (newPosition.liqRefreshTime !== 0 &&
                newPosition.concLiq === 0 &&
                newPosition.rewardLiq !== 0) ||
            forceOnchainLiqUpdate
        ) {
            const pos = crocEnv.positions(
                position.base,
                position.quote,
                position.user,
            );

            const [positionRewards, rangePos] = await Promise.all([
                pos.queryRewards(position.bidTick, position.askTick),
                pos.queryRangePos(position.bidTick, position.askTick),
            ]);

            newPosition.feesLiqBase = bigIntToFloat(
                positionRewards.baseRewards,
            );
            newPosition.feesLiqQuote = bigIntToFloat(
                positionRewards.quoteRewards,
            );
            newPosition.positionLiq = bigIntToFloat(rangePos.liq);
        } else {
            newPosition.positionLiq = position.concLiq;

            newPosition.feesLiqBase =
                position.rewardLiq * Math.sqrt(poolPriceNonDisplay);
            newPosition.feesLiqQuote =
                position.rewardLiq / Math.sqrt(poolPriceNonDisplay);
        }
        newPosition.positionLiqBase = bigIntToFloat(
            baseTokenForConcLiq(
                poolPriceNonDisplay,
                floatToBigInt(newPosition.positionLiq),
                tickToPrice(position.bidTick),
                tickToPrice(position.askTick),
            ),
        );
        newPosition.positionLiqQuote = bigIntToFloat(
            quoteTokenForConcLiq(
                poolPriceNonDisplay,
                floatToBigInt(newPosition.positionLiq),
                tickToPrice(position.bidTick),
                tickToPrice(position.askTick),
            ),
        );

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
        removeExtraTrailingZeros: true,
    });

    const liqQuoteNum = newPosition.positionLiqQuoteDecimalCorrected;
    newPosition.positionLiqQuoteTruncated = getFormattedNumber({
        value: liqQuoteNum,
        zeroDisplay: '0',
        removeExtraTrailingZeros: true,
    });

    const poolPrice = toDisplayPrice(
        poolPriceNonDisplay,
        baseTokenDecimals,
        quoteTokenDecimals,
    );
    newPosition.curentPoolPriceDisplayNum = poolPrice;

    if (quotePrice && basePrice) {
        newPosition.totalValueUSD =
            quotePrice *
                (newPosition.positionLiqQuoteDecimalCorrected +
                    (newPosition.feesLiqQuoteDecimalCorrected || 0)) +
            basePrice *
                (newPosition.positionLiqBaseDecimalCorrected +
                    (newPosition.feesLiqBaseDecimalCorrected || 0));
        if (
            newPosition.feesLiqQuoteDecimalCorrected &&
            newPosition.feesLiqBaseDecimalCorrected
        )
            newPosition.feesValueUSD =
                quotePrice * newPosition.feesLiqQuoteDecimalCorrected +
                basePrice * newPosition.feesLiqBaseDecimalCorrected;
    } else if (basePrice) {
        const quotePrice = basePrice * poolPrice;
        newPosition.totalValueUSD =
            quotePrice *
                (newPosition.positionLiqQuoteDecimalCorrected +
                    (newPosition.feesLiqQuoteDecimalCorrected || 0)) +
            basePrice *
                (newPosition.positionLiqBaseDecimalCorrected +
                    (newPosition.feesLiqBaseDecimalCorrected || 0));
        if (newPosition.feesLiqBaseDecimalCorrected)
            newPosition.feesValueUSD =
                basePrice * newPosition.feesLiqBaseDecimalCorrected;
    } else if (quotePrice) {
        const basePrice = quotePrice / poolPrice;
        newPosition.totalValueUSD =
            basePrice *
                (newPosition.positionLiqBaseDecimalCorrected +
                    (newPosition.feesLiqBaseDecimalCorrected || 0)) +
            quotePrice *
                (newPosition.positionLiqQuoteDecimalCorrected +
                    (newPosition.feesLiqQuoteDecimalCorrected || 0));
        if (newPosition.feesLiqQuoteDecimalCorrected)
            newPosition.feesValueUSD =
                quotePrice * newPosition.feesLiqQuoteDecimalCorrected;
    } else {
        newPosition.totalValueUSD = 0.0;
        newPosition.feesValueUSD = 0.0;
    }

    newPosition.apy = position.aprEst * 100;

    newPosition.serverPositionId = position.positionId;

    newPosition.positionId = posHash;

    return newPosition;
};

export function sumTotalValueUSD(
    positions: PositionIF[] | LimitOrderIF[],
): number {
    return positions.reduce((sum, position) => sum + position.totalValueUSD, 0);
}

export type PositionStatsFn = (
    user: string,
    askTick: number,
    bidTick: number,
    base: string,
    quote: string,
    poolIdx: number,
    chainId: string,
    positionType: string,
    time: number, // arbitrary number to cache for an amount of time
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<any>;

export type PositionUpdateFn = (
    position: PositionIF,
    time: number, // arbitrary number to cache for an amount of time
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<PositionIF>;
