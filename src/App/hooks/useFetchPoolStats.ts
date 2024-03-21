import { useEffect, useState, useContext } from 'react';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { AppStateContext } from '../../contexts/AppStateContext';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import { CachedDataContext } from '../../contexts/CachedDataContext';

import {
    getUnicodeCharacter,
    getMoneynessRank,
    getFormattedNumber,
} from '../../ambient-utils/dataLayer';
// import { estimateFrom24HrRangeApr } from '../../ambient-utils/api';
import { sortBaseQuoteTokens, toDisplayPrice } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { linkGenMethodsIF, useLinkGen } from '../../utils/hooks/useLinkGen';
import { PoolIF, PoolStatIF } from '../../ambient-utils/types';
import { CACHE_UPDATE_FREQ_IN_MS } from '../../ambient-utils/constants';
import { TokenContext } from '../../contexts/TokenContext';

const useFetchPoolStats = (pool: PoolIF): PoolStatIF => {
    const {
        server: { isEnabled: isServerEnabled },
        isUserIdle,
    } = useContext(AppStateContext);
    const {
        cachedPoolStatsFetch,
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
    } = useContext(CachedDataContext);
    const {
        crocEnv,
        activeNetwork,
        provider,
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { tokens } = useContext(TokenContext);

    const [poolPriceDisplay, setPoolPriceDisplay] = useState<
        string | undefined
    >();
    const [shouldInvertDisplay, setShouldInvertDisplay] = useState<
        boolean | undefined
    >(!pool.isBaseTokenMoneynessGreaterOrEqual);

    const baseTokenCharacter = poolPriceDisplay
        ? getUnicodeCharacter(pool.base.symbol)
        : '';
    const quoteTokenCharacter = poolPriceDisplay
        ? getUnicodeCharacter(pool.quote.symbol)
        : '';

    const baseLogoUri = shouldInvertDisplay
        ? pool?.base.logoURI
        : pool?.quote.logoURI;

    const quoteLogoUri = shouldInvertDisplay
        ? pool?.quote.logoURI
        : pool?.base.logoURI;

    // useEffect to get spot price when tokens change and block updates
    useEffect(() => {
        if (isServerEnabled && crocEnv && lastBlockNumber !== 0) {
            (async () => {
                const spotPrice = await cachedQuerySpotPrice(
                    crocEnv,
                    pool.base.address,
                    pool.quote.address,
                    chainId,
                    Math.floor(Date.now() / 10000), // 10 second cache
                );

                if (spotPrice) {
                    const displayPrice = toDisplayPrice(
                        spotPrice,
                        pool.base.decimals,
                        pool.quote.decimals,
                    );

                    const isBaseTokenMoneynessGreaterOrEqual =
                        pool.base.address && pool.quote.address
                            ? getMoneynessRank(pool.base.symbol) -
                                  getMoneynessRank(pool.quote.symbol) >=
                              0
                            : false;

                    const shouldInvertDisplay =
                        !isBaseTokenMoneynessGreaterOrEqual;

                    setShouldInvertDisplay(shouldInvertDisplay);

                    const displayPriceWithInversion = shouldInvertDisplay
                        ? 1 / displayPrice
                        : displayPrice;

                    const displayPriceWithFormatting = getFormattedNumber({
                        value: displayPriceWithInversion,
                    });

                    setPoolPriceDisplay(displayPriceWithFormatting);
                } else {
                    setPoolPriceDisplay(undefined);
                }
            })();
        }
    }, [isServerEnabled, chainId, crocEnv, lastBlockNumber]);

    const [poolVolume, setPoolVolume] = useState<string | undefined>();
    const [poolVolume24h, setPoolVolume24h] = useState<string | undefined>();
    const [poolTvl, setPoolTvl] = useState<string | undefined>();
    const [poolFeesTotal, setPoolFeesTotal] = useState<string | undefined>();
    // const [poolApy, setPoolApy] = useState<string | undefined>();
    const [quoteTvlDecimal, setQuoteTvlDecimal] = useState<
        number | undefined
    >();
    const [baseTvlDecimal, setBaseTvlDecimal] = useState<number | undefined>();
    const [quoteTvlUsd, setQuoteTvlUsd] = useState<number | undefined>();
    const [baseTvlUsd, setBaseTvlUsd] = useState<number | undefined>();

    const [poolPriceChangePercent, setPoolPriceChangePercent] = useState<
        string | undefined
    >();

    const [isPoolPriceChangePositive, setIsPoolPriceChangePositive] =
        useState<boolean>(true);

    const poolIndex = lookupChain(chainId).poolIndex;

    const [baseAddr, quoteAddr] = sortBaseQuoteTokens(
        pool?.base.address,
        pool?.quote.address,
    );

    // Reset pool metric states that require asynchronous updates when pool changes
    const resetPoolStats = () => {
        setPoolVolume(undefined);
        setPoolVolume24h(undefined);
        setPoolTvl(undefined);
        setPoolFeesTotal(undefined);
        // setPoolApy(undefined);
        setQuoteTvlDecimal(undefined);
        setBaseTvlDecimal(undefined);
        setQuoteTvlUsd(undefined);
        setBaseTvlUsd(undefined);
        setPoolPriceChangePercent(undefined);
        setIsPoolPriceChangePositive(true);
    };

    useEffect(() => {
        resetPoolStats();
    }, [baseAddr + quoteAddr]);

    const fetchPoolStats = () => {
        (async () => {
            if (
                poolIndex &&
                chainId &&
                lastBlockNumber &&
                shouldInvertDisplay !== undefined &&
                crocEnv &&
                provider &&
                !isUserIdle
            ) {
                const poolStatsNow = await cachedPoolStatsFetch(
                    chainId,
                    pool.base.address,
                    pool.quote.address,
                    poolIndex,
                    Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS),
                    crocEnv,
                    activeNetwork.graphCacheUrl,
                    cachedFetchTokenPrice,
                    cachedTokenDetails,
                    tokens.tokenUniv,
                );

                const ydayTime = Math.floor(Date.now() / 1000 - 24 * 3600);

                const poolStats24hAgo = await cachedPoolStatsFetch(
                    chainId,
                    pool.base.address,
                    pool.quote.address,
                    poolIndex,
                    Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS),
                    crocEnv,
                    activeNetwork.graphCacheUrl,
                    cachedFetchTokenPrice,
                    cachedTokenDetails,
                    tokens.tokenUniv,
                    ydayTime,
                );

                const volumeTotalNow = poolStatsNow?.volumeTotalUsd;
                const volumeTotal24hAgo = poolStats24hAgo?.volumeTotalUsd;

                const volumeChange24h = volumeTotalNow - volumeTotal24hAgo;

                const nowPrice = poolStatsNow?.lastPriceIndic;
                const ydayPrice = poolStats24hAgo?.lastPriceIndic;

                const priceChangeResult =
                    ydayPrice && nowPrice && ydayPrice > 0 && nowPrice > 0
                        ? shouldInvertDisplay
                            ? ydayPrice / nowPrice - 1.0
                            : nowPrice / ydayPrice - 1.0
                        : 0.0;

                const tvlResult = poolStatsNow?.tvlTotalUsd;
                const feesTotalResult = poolStatsNow?.feesTotalUsd;
                const volumeResult = poolStatsNow?.volumeTotalUsd;

                setQuoteTvlDecimal(poolStatsNow.quoteTvlDecimal);
                setBaseTvlDecimal(poolStatsNow.baseTvlDecimal);
                setQuoteTvlUsd(poolStatsNow.quoteTvlUsd);
                setBaseTvlUsd(poolStatsNow.baseTvlUsd);

                if (tvlResult) {
                    const tvlString = getFormattedNumber({
                        value: tvlResult,
                        isTvl: true,
                    });
                    setPoolTvl(tvlString);
                }
                if (feesTotalResult) {
                    const feesTotalString = getFormattedNumber({
                        value: feesTotalResult,
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

                // try {
                //     const RANGE_WIDTH = 0.1;

                //     const apyEst = estimateFrom24HrRangeApr(
                //         RANGE_WIDTH,
                //         pool.base.address,
                //         pool.quote.address,
                //         crocEnv,
                //         provider,
                //         lastBlockNumber,
                //     );
                //     const apyResult = await apyEst;

                //     if (apyResult) {
                //         const apyString = apyResult.toLocaleString(undefined, {
                //             minimumFractionDigits: 2,
                //             maximumFractionDigits: 2,
                //         });
                //         setPoolApy(apyString);
                //     }
                // } catch (error) {
                //     // IS_LOCAL_ENV && console.log({ error });
                // }

                try {
                    if (!priceChangeResult) {
                        setPoolPriceChangePercent(undefined);
                        setIsPoolPriceChangePositive(true);
                        return;
                    }

                    if (
                        priceChangeResult > -0.0001 &&
                        priceChangeResult < 0.0001
                    ) {
                        setPoolPriceChangePercent('No Change');
                        setIsPoolPriceChangePositive(true);
                    } else {
                        priceChangeResult > 0
                            ? setIsPoolPriceChangePositive(true)
                            : setIsPoolPriceChangePositive(false);

                        const priceChangePercent = priceChangeResult * 100;

                        const priceChangeString =
                            priceChangePercent > 0
                                ? '+' +
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
        })();
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

    const minuteInterval = Math.floor(Date.now() / 1000 / 60);

    useEffect(() => {
        if (isServerEnabled) fetchPoolStats();
    }, [
        isUserIdle,
        poolVolume === undefined,
        isServerEnabled,
        shouldInvertDisplay,
        minuteInterval,
        lastBlockNumber === 0,
        !!crocEnv,
        !!provider,
        poolIndex,
        pool.base.address + pool.quote.address,
    ]);

    return {
        baseLogoUri,
        quoteLogoUri,
        poolVolume,
        poolVolume24h,
        poolTvl,
        poolFeesTotal,
        // poolApy,
        poolPriceChangePercent,
        isPoolPriceChangePositive,
        baseTokenCharacter,
        quoteTokenCharacter,
        poolPrice,
        poolLink,
        shouldInvertDisplay,
        quoteTvlUsd,
        baseTvlUsd,
        quoteTvlDecimal,
        baseTvlDecimal,
    };
};
export default useFetchPoolStats;
