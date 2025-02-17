import { useContext, useEffect, useMemo, useState } from 'react';
import { AppStateContext } from '../../contexts/AppStateContext';
import { CachedDataContext } from '../../contexts/CachedDataContext';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';

import { toDisplayPrice } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { estimateFrom24HrAmbientApr } from '../../ambient-utils/api';
import {
    expandPoolStats,
    getFormattedNumber,
    getMoneynessRank,
    getUnicodeCharacter,
    isETHorStakedEthToken,
} from '../../ambient-utils/dataLayer';
import { PoolIF, PoolStatIF } from '../../ambient-utils/types';
import { linkGenMethodsIF, useLinkGen } from '../../utils/hooks/useLinkGen';
// import{ CACHE_UPDATE_FREQ_IN_MS } from '../../ambient-utils/constants';
import { TokenContext } from '../../contexts/TokenContext';
import { TradeDataContext } from '../../contexts/TradeDataContext';

const useFetchPoolStats = (
    pool: PoolIF,
    poolList: PoolIF[] | undefined,
    spotPriceRetrieved: number | undefined,
    isTradePair = false,
    enableTotalSupply = false,
    didUserFlipDenom = false,
): PoolStatIF => {
    const {
        server: { isEnabled: isServerEnabled },
        isUserIdle,
    } = useContext(AppStateContext);

    const {
        // cachedPoolStatsFetch,
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
    } = useContext(CachedDataContext);

    const { poolPriceNonDisplay, setPoolPriceNonDisplay, setLimitTick } =
        useContext(TradeDataContext);

    const [localPoolPriceNonDisplay, setLocalPoolPriceNonDisplay] = useState<
        [string, number] | undefined
    >();

    const {
        crocEnv,
        // activeNetwork,
        provider,
    } = useContext(CrocEnvContext);

    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);

    const { lastBlockNumber, nativeTokenUsdPrice } =
        useContext(ChainDataContext);
    // useMemo to filter allPoolStats for the current pool
    const activeTradePoolStats = useMemo(
        () =>
            poolList?.find(
                (poolListEntry: PoolIF) =>
                    poolListEntry.base.toLowerCase() ===
                        pool.base.toLowerCase() &&
                    poolListEntry.quote.toLowerCase() ===
                        pool.quote.toLowerCase(),
            ),
        [JSON.stringify(poolList), pool.base, pool.quote],
    );

    const { tokens } = useContext(TokenContext);

    const [poolPriceDisplayNum, setPoolPriceDisplayNum] = useState<
        number | undefined
    >();

    const [poolPriceDisplay, setPoolPriceDisplay] = useState<
        string | undefined
    >();

    const isBaseTokenMoneynessGreaterOrEqual = useMemo(
        () =>
            pool.baseToken.symbol && pool.quoteToken.symbol
                ? getMoneynessRank(pool.baseToken.symbol) -
                      getMoneynessRank(pool.quoteToken.symbol) >=
                  0
                : false,
        [pool.baseToken.symbol, pool.quoteToken.symbol],
    );

    const shouldInvertDisplay = !isBaseTokenMoneynessGreaterOrEqual;

    const [isPoolInitialized, setIsPoolInitialized] = useState<
        boolean | undefined
    >();

    const baseTokenCharacter = poolPriceDisplay
        ? getUnicodeCharacter(pool.baseToken.symbol)
        : '';
    const quoteTokenCharacter = poolPriceDisplay
        ? getUnicodeCharacter(pool.quoteToken.symbol)
        : '';

    const baseLogoUri = shouldInvertDisplay
        ? pool?.baseToken.logoURI
        : pool?.quoteToken.logoURI;

    const quoteLogoUri = shouldInvertDisplay
        ? pool?.quoteToken.logoURI
        : pool?.baseToken.logoURI;

    const poolPriceCacheTime = isTradePair
        ? isUserIdle
            ? Math.floor(Date.now() / 30000) // 30 second interval if  idle
            : Math.floor(Date.now() / 5000) // 5 second cache for trade pair
        : isUserIdle
          ? Math.floor(Date.now() / 60000) // 60 second interval if  idle
          : Math.floor(Date.now() / 10000); // 10 second interval if not idle

    // useEffect to get spot price when tokens change and block updates
    useEffect(() => {
        if (isServerEnabled && crocEnv) {
            (async () => {
                if (
                    !crocEnv ||
                    (await crocEnv.context).chain.chainId !== chainId
                )
                    return;

                const spotPrice =
                    spotPriceRetrieved !== undefined
                        ? spotPriceRetrieved
                        : await cachedQuerySpotPrice(
                              crocEnv,
                              pool.base,
                              pool.quote,
                              chainId,
                              poolPriceCacheTime,
                          );
                if (spotPrice) {
                    setIsPoolInitialized(true);
                    setLocalPoolPriceNonDisplay([
                        pool.base + pool.quote,
                        spotPrice,
                    ]);

                    if (
                        isTradePair &&
                        spotPrice &&
                        spotPrice !== poolPriceNonDisplay
                    ) {
                        setPoolPriceNonDisplay(spotPrice);
                    }
                    const displayPrice = toDisplayPrice(
                        spotPrice,
                        pool.baseToken.decimals,
                        pool.quoteToken.decimals,
                    );

                    setPoolPriceDisplayNum(displayPrice);

                    const displayPriceWithInversion = shouldInvertDisplay
                        ? 1 / displayPrice
                        : displayPrice;

                    const displayPriceWithFormatting = getFormattedNumber({
                        value: displayPriceWithInversion,
                    });
                    setPoolPriceDisplay(displayPriceWithFormatting);
                } else {
                    setPoolPriceDisplay(undefined);
                    setLocalPoolPriceNonDisplay(undefined);
                    setPoolPriceDisplayNum(undefined);
                    setIsPoolInitialized(false);
                }
            })();
        }
    }, [
        spotPriceRetrieved,
        isServerEnabled,
        chainId,
        crocEnv,
        lastBlockNumber !== 0,
        poolPriceNonDisplay,
        poolPriceCacheTime,
        pool.base,
        pool.quote,
        isTradePair,
    ]);

    const [poolVolume, setPoolVolume] = useState<string | undefined>();
    const [poolVolume24h, setPoolVolume24h] = useState<string | undefined>();
    const [poolFees24h, setPoolFees24h] = useState<string | undefined>();
    const [apr, setApr] = useState<string | undefined>();
    const [poolTvl, setPoolTvl] = useState<string | undefined>();
    const [poolFeesTotal, setPoolFeesTotal] = useState<string | undefined>();
    const [poolAmbientAprEstimate, setPoolAmbientAprEstimate] = useState<
        number | undefined
    >();
    const [quoteTvlDecimal, setQuoteTvlDecimal] = useState<
        number | undefined
    >();
    const [baseTvlDecimal, setBaseTvlDecimal] = useState<number | undefined>();
    const [quoteTvlUsd, setQuoteTvlUsd] = useState<number | undefined>();
    const [baseTvlUsd, setBaseTvlUsd] = useState<number | undefined>();

    const [baseFdvUsd, setBaseFdvUsd] = useState<number | undefined>();
    const [quoteFdvUsd, setQuoteFdvUsd] = useState<number | undefined>();

    const [poolPriceChangePercent, setPoolPriceChangePercent] = useState<
        string | undefined
    >();

    const [isPoolPriceChangePositive, setIsPoolPriceChangePositive] =
        useState<boolean>(true);

    const poolIndex = lookupChain(chainId).poolIndex;

    const [baseAddr, quoteAddr] = [pool?.base, pool?.quote];

    // Reset pool metric states that require asynchronous updates when pool changes
    const resetPoolStats = () => {
        setPoolVolume(undefined);
        setPoolVolume24h(undefined);
        setPoolTvl(undefined);
        setPoolFeesTotal(undefined);
        setPoolAmbientAprEstimate(undefined);
        setQuoteTvlDecimal(undefined);
        setBaseTvlDecimal(undefined);
        setBaseFdvUsd(undefined);
        setQuoteFdvUsd(undefined);
        setQuoteTvlUsd(undefined);
        setBaseTvlUsd(undefined);
        setPoolPriceChangePercent(undefined);
        setIsPoolPriceChangePositive(true);
        setPoolPriceDisplayNum(undefined);
        setPoolFees24h(undefined);
        setApr(undefined);
        if (!location.pathname.includes('limitTick')) {
            setLimitTick(undefined);
        }
    };

    useEffect(() => {
        resetPoolStats();
    }, [baseAddr + quoteAddr]);

    const [basePrice, setBasePrice] = useState<number | undefined>();
    const [quotePrice, setQuotePrice] = useState<number | undefined>();

    useEffect(() => {
        (async () => {
            if (poolPriceDisplayNum) {
                const baseTokenPrice =
                    (await cachedFetchTokenPrice(baseAddr, chainId))
                        ?.usdPrice || 0.0;
                const quoteTokenPrice =
                    (await cachedFetchTokenPrice(quoteAddr, chainId))
                        ?.usdPrice || 0.0;

                if (baseTokenPrice) {
                    setBasePrice(baseTokenPrice);
                } else if (
                    isETHorStakedEthToken(baseAddr) &&
                    nativeTokenUsdPrice
                ) {
                    setBasePrice(nativeTokenUsdPrice);
                } else if (poolPriceDisplayNum && quoteTokenPrice) {
                    // calculation of estimated base price below may be backwards;
                    // having a hard time finding an example of base missing a price
                    const estimatedBasePrice =
                        quoteTokenPrice / poolPriceDisplayNum;
                    setBasePrice(estimatedBasePrice);
                } else {
                    setBasePrice(undefined);
                }
                if (quoteTokenPrice) {
                    setQuotePrice(quoteTokenPrice);
                } else if (
                    isETHorStakedEthToken(quoteAddr) &&
                    nativeTokenUsdPrice
                ) {
                    setQuotePrice(nativeTokenUsdPrice);
                } else if (poolPriceDisplayNum && baseTokenPrice) {
                    const estimatedQuotePrice =
                        baseTokenPrice * poolPriceDisplayNum;
                    setQuotePrice(estimatedQuotePrice);
                } else {
                    setQuotePrice(undefined);
                }
            }
        })();
    }, [
        baseAddr,
        quoteAddr,
        chainId,
        poolPriceDisplayNum,
        nativeTokenUsdPrice === undefined,
    ]);

    const fetchPoolStats = async () => {
        if (
            activeTradePoolStats &&
            lastBlockNumber &&
            shouldInvertDisplay !== undefined &&
            crocEnv &&
            provider &&
            (!isTradePair ||
                (localPoolPriceNonDisplay !== undefined &&
                    localPoolPriceNonDisplay[0] === pool.base + pool.quote))
        ) {
            const expandedPoolStats = await expandPoolStats(
                activeTradePoolStats,
                crocEnv,
                cachedFetchTokenPrice,
                cachedTokenDetails,
                cachedQuerySpotPrice,
                tokens.tokenUniv,
                enableTotalSupply,
            );

            const volumeChange24h = expandedPoolStats.volumeChange24h || 0;

            const nowPrice = expandedPoolStats?.lastPriceSwap;
            const ydayPrice = expandedPoolStats?.priceSwap24hAgo;

            const priceChangeResult =
                ydayPrice && nowPrice && ydayPrice > 0 && nowPrice > 0
                    ? shouldInvertDisplay
                        ? ydayPrice / nowPrice - 1.0
                        : nowPrice / ydayPrice - 1.0
                    : undefined;

            const tvlResult = expandedPoolStats.tvlTotalUsd || 0;

            const volumeResult = expandedPoolStats.volumeTotalUsd || 0;

            const feesChange24h = expandedPoolStats.feesChange24h || 0;

            setQuoteTvlDecimal(expandedPoolStats.quoteTvlDecimal);
            setBaseTvlDecimal(expandedPoolStats.baseTvlDecimal);
            setQuoteTvlUsd(expandedPoolStats.quoteTvlUsd);
            setBaseFdvUsd(expandedPoolStats.baseFdvUsd);
            setQuoteFdvUsd(expandedPoolStats.quoteFdvUsd);
            setBaseTvlUsd(expandedPoolStats.baseTvlUsd);

            if (tvlResult) {
                const tvlString = getFormattedNumber({
                    value: tvlResult,
                    isTvl: true,
                });
                setPoolTvl(tvlString);
            }
            if (expandedPoolStats.feesTotalUsd) {
                const feesTotalString = getFormattedNumber({
                    value: expandedPoolStats.feesTotalUsd,
                    isTvl: false,
                });
                setPoolFeesTotal(feesTotalString);
            }
            if (volumeResult) {
                const volumeString = getFormattedNumber({
                    value: volumeResult,
                });
                setPoolVolume(volumeString);
            }
            if (volumeChange24h) {
                const volumeChange24hString = getFormattedNumber({
                    value: volumeChange24h,
                });

                setPoolVolume24h(volumeChange24hString);
            }
            if (feesChange24h) {
                const feesChange24hString = getFormattedNumber({
                    value: feesChange24h,
                });
                setPoolFees24h(feesChange24hString);
            }
            if (feesChange24h && tvlResult) {
                const aprNum = feesChange24h / tvlResult;
                const aprString = getFormattedNumber({
                    value: aprNum * 100 * 365,
                    isPercentage: true,
                });
                setApr(aprString);
            }

            if (isTradePair) {
                try {
                    const ambientAprEst = await estimateFrom24HrAmbientApr(
                        pool.base,
                        pool.quote,
                        crocEnv,
                        provider,
                        lastBlockNumber,
                    );

                    if (ambientAprEst) {
                        setPoolAmbientAprEstimate(ambientAprEst * 100);
                    }
                } catch (error) {
                    // IS_LOCAL_ENV && console.log({ error });
                }
            }

            try {
                if (priceChangeResult === undefined) {
                    return;
                }
                const priceChangePercent = priceChangeResult * 100;

                if (priceChangeResult > -0.0001 && priceChangeResult < 0.0001) {
                    setPoolPriceChangePercent('No Change');
                    setIsPoolPriceChangePositive(true);
                } else {
                    (priceChangeResult > 0 && !didUserFlipDenom) ||
                    (priceChangeResult < 0 && didUserFlipDenom)
                        ? setIsPoolPriceChangePositive(true)
                        : setIsPoolPriceChangePositive(false);

                    const priceChangeString =
                        (priceChangeResult > 0 && !didUserFlipDenom) ||
                        (priceChangeResult < 0 && didUserFlipDenom)
                            ? '+' +
                              Math.abs(priceChangePercent).toLocaleString(
                                  undefined,
                                  {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  },
                              ) +
                              '%'
                            : priceChangeResult > 0 && didUserFlipDenom
                              ? '-' +
                                priceChangePercent.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }) +
                                '%'
                              : priceChangePercent.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }) + '%';
                    setPoolPriceChangePercent(priceChangeString);
                }
            } catch (error) {
                setPoolPriceChangePercent(undefined);
            }
        }
    };

    const poolPrice =
        poolPriceDisplay === undefined
            ? '…'
            : shouldInvertDisplay
              ? `${quoteTokenCharacter}${poolPriceDisplay}`
              : `${baseTokenCharacter}${poolPriceDisplay}`;

    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');

    const poolLink = linkGenMarket.getFullURL({
        chain: chainId,
        tokenA: baseAddr,
        tokenB: quoteAddr,
    });

    useEffect(() => {
        if (isServerEnabled && lastBlockNumber !== 0) fetchPoolStats();
    }, [
        isUserIdle
            ? Math.floor(Date.now() / 120000)
            : Math.floor(Date.now() / 60000),
        poolVolume === undefined,
        isServerEnabled,
        shouldInvertDisplay,
        lastBlockNumber !== 0,
        crocEnv,
        provider,
        poolIndex,
        pool.base + pool.quote,
        localPoolPriceNonDisplay,
        didUserFlipDenom,
    ]);

    return {
        baseLogoUri,
        quoteLogoUri,
        poolVolume,
        poolVolume24h,
        poolFees24h,
        apr,
        poolTvl,
        poolFeesTotal,
        poolAmbientAprEstimate,
        poolPriceChangePercent,
        isPoolPriceChangePositive,
        baseTokenCharacter,
        quoteTokenCharacter,
        poolPrice,
        poolPriceDisplay: poolPriceDisplayNum,
        isPoolInitialized,
        poolLink,
        shouldInvertDisplay,
        quoteTvlUsd,
        baseFdvUsd,
        quoteFdvUsd,
        baseTvlUsd,
        quoteTvlDecimal,
        baseTvlDecimal,
        basePrice,
        quotePrice,
    };
};
export default useFetchPoolStats;
