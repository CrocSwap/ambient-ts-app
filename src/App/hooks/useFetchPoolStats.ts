import { useEffect, useState, useContext } from 'react';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { AppStateContext } from '../../contexts/AppStateContext';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import { CachedDataContext } from '../../contexts/CachedDataContext';

import {
    getUnicodeCharacter,
    getMoneynessRank,
    getFormattedNumber,
    expandPoolStats,
    isETHorStakedEthToken,
} from '../../ambient-utils/dataLayer';
// import { estimateFrom24HrRangeApr } from '../../ambient-utils/api';
import { toDisplayPrice } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { linkGenMethodsIF, useLinkGen } from '../../utils/hooks/useLinkGen';
import { PoolIF, PoolStatIF } from '../../ambient-utils/types';
import { CACHE_UPDATE_FREQ_IN_MS } from '../../ambient-utils/constants';
import { TokenContext } from '../../contexts/TokenContext';
import { TradeDataContext } from '../../contexts/TradeDataContext';

const useFetchPoolStats = (
    pool: PoolIF,
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
        cachedPoolStatsFetch,
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
        activeNetwork,
        provider,
        chainData: { chainId },
        ethMainnetUsdPrice,
    } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { tokens } = useContext(TokenContext);

    const [poolPriceDisplayNum, setPoolPriceDisplayNum] = useState<
        number | undefined
    >();

    const [poolPriceDisplay, setPoolPriceDisplay] = useState<
        string | undefined
    >();
    const [shouldInvertDisplay, setShouldInvertDisplay] = useState<
        boolean | undefined
    >(!pool.isBaseTokenMoneynessGreaterOrEqual);

    const [isPoolInitialized, setIsPoolInitialized] = useState<
        boolean | undefined
    >();

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

    const poolPriceCacheTime = isTradePair
        ? isUserIdle
            ? Math.floor(Date.now() / 30000) // 30 second interval if  idle
            : Math.floor(Date.now() / 5000) // 5 second cache for trade pair
        : isUserIdle
          ? Math.floor(Date.now() / 60000) // 30 second interval if  idle
          : Math.floor(Date.now() / 10000); // 10 second interval if not idle

    // useEffect to get spot price when tokens change and block updates
    useEffect(() => {
        if (isServerEnabled && crocEnv) {
            (async () => {
                const spotPrice =
                    spotPriceRetrieved !== undefined
                        ? spotPriceRetrieved
                        : await cachedQuerySpotPrice(
                              crocEnv,
                              pool.base.address,
                              pool.quote.address,
                              chainId,
                              poolPriceCacheTime,
                          );
                if (spotPrice) {
                    setIsPoolInitialized(true);
                    setLocalPoolPriceNonDisplay([
                        pool.base.address + pool.quote.address,
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
                        pool.base.decimals,
                        pool.quote.decimals,
                    );

                    setPoolPriceDisplayNum(displayPrice);

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
                    setIsPoolInitialized(false);
                }
            })();
        }
    }, [
        spotPriceRetrieved,
        isServerEnabled,
        chainId,
        crocEnv !== undefined,
        lastBlockNumber !== 0,
        poolPriceNonDisplay,
        poolPriceCacheTime,
        pool.base.address,
        pool.quote.address,
        isTradePair,
    ]);

    const [poolVolume, setPoolVolume] = useState<string | undefined>();
    const [poolVolume24h, setPoolVolume24h] = useState<string | undefined>();
    const [poolFees24h, setPoolFees24h] = useState<string | undefined>();
    const [apr, setApr] = useState<string | undefined>();
    const [poolTvl, setPoolTvl] = useState<string | undefined>();
    const [poolFeesTotal, setPoolFeesTotal] = useState<string | undefined>();
    // const [poolApy, setPoolApy] = useState<string | undefined>();
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

    const [baseAddr, quoteAddr] = [pool?.base.address, pool?.quote.address];

    // Reset pool metric states that require asynchronous updates when pool changes
    const resetPoolStats = () => {
        setPoolVolume(undefined);
        setPoolVolume24h(undefined);
        setPoolTvl(undefined);
        setPoolFeesTotal(undefined);
        // setPoolApy(undefined);
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
        if (crocEnv && poolPriceDisplayNum) {
            const fetchTokenPrice = async () => {
                const baseTokenPrice =
                    (await cachedFetchTokenPrice(baseAddr, chainId, crocEnv))
                        ?.usdPrice || 0.0;
                const quoteTokenPrice =
                    (await cachedFetchTokenPrice(quoteAddr, chainId, crocEnv))
                        ?.usdPrice || 0.0;
                if (baseTokenPrice) {
                    setBasePrice(baseTokenPrice);
                } else if (
                    isETHorStakedEthToken(baseAddr) &&
                    ethMainnetUsdPrice
                ) {
                    setBasePrice(ethMainnetUsdPrice);
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
                    ethMainnetUsdPrice
                ) {
                    setQuotePrice(ethMainnetUsdPrice);
                } else if (poolPriceDisplayNum && baseTokenPrice) {
                    const estimatedQuotePrice =
                        baseTokenPrice * poolPriceDisplayNum;
                    setQuotePrice(estimatedQuotePrice);
                } else {
                    setQuotePrice(undefined);
                }
            };

            fetchTokenPrice();
        }
    }, [
        baseAddr,
        quoteAddr,
        chainId,
        crocEnv === undefined,
        poolPriceDisplayNum,
        ethMainnetUsdPrice === undefined,
    ]);

    const fetchPoolStats = async () => {
        if (
            poolIndex &&
            chainId &&
            lastBlockNumber &&
            shouldInvertDisplay !== undefined &&
            crocEnv &&
            provider &&
            localPoolPriceNonDisplay !== undefined &&
            // check if the local pool price for the current pool
            localPoolPriceNonDisplay[0] ===
                pool.base.address + pool.quote.address
        ) {
            const poolStatsNow = await cachedPoolStatsFetch(
                chainId,
                pool.base.address,
                pool.quote.address,
                poolIndex,
                Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS),
                activeNetwork.graphCacheUrl,
            );

            const expandedPoolStatsNow = await expandPoolStats(
                poolStatsNow,
                pool.base.address,
                pool.quote.address,
                chainId,
                crocEnv,
                cachedFetchTokenPrice,
                cachedTokenDetails,
                cachedQuerySpotPrice,
                tokens.allDefaultTokens,
                enableTotalSupply,
            );

            const ydayTime = Math.floor(Date.now() / 1000 - 24 * 3600);

            const poolStats24hAgo = await cachedPoolStatsFetch(
                chainId,
                pool.base.address,
                pool.quote.address,
                poolIndex,
                Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS),
                activeNetwork.graphCacheUrl,
                ydayTime,
            );

            const expandedPoolStats24hAgo = await expandPoolStats(
                poolStats24hAgo,
                pool.base.address,
                pool.quote.address,
                chainId,
                crocEnv,
                cachedFetchTokenPrice,
                cachedTokenDetails,
                cachedQuerySpotPrice,
                tokens.allDefaultTokens,
            );

            const volumeTotalNow = expandedPoolStatsNow?.volumeTotalUsd;
            const volumeTotal24hAgo = expandedPoolStats24hAgo?.volumeTotalUsd;
            const volumeChange24h = volumeTotalNow - volumeTotal24hAgo;

            const nowPrice = localPoolPriceNonDisplay[1];
            const ydayPrice = expandedPoolStats24hAgo?.lastPriceIndic;

            const priceChangeResult =
                ydayPrice && nowPrice && ydayPrice > 0 && nowPrice > 0
                    ? shouldInvertDisplay
                        ? ydayPrice / nowPrice - 1.0
                        : nowPrice / ydayPrice - 1.0
                    : 0.0;

            const tvlResult = expandedPoolStatsNow?.tvlTotalUsd;
            const feesTotalNow = expandedPoolStatsNow?.feesTotalUsd;
            const feesTotal24hAgo = expandedPoolStats24hAgo?.feesTotalUsd;
            const volumeResult = expandedPoolStatsNow?.volumeTotalUsd;

            const feesChange24h = feesTotalNow - feesTotal24hAgo;

            setQuoteTvlDecimal(expandedPoolStatsNow.quoteTvlDecimal);
            setBaseTvlDecimal(expandedPoolStatsNow.baseTvlDecimal);
            setQuoteTvlUsd(expandedPoolStatsNow.quoteTvlUsd);
            setBaseFdvUsd(expandedPoolStatsNow.baseFdvUsd);
            setQuoteFdvUsd(expandedPoolStatsNow.quoteFdvUsd);
            setBaseTvlUsd(expandedPoolStatsNow.baseTvlUsd);

            if (tvlResult) {
                const tvlString = getFormattedNumber({
                    value: tvlResult,
                    isTvl: true,
                });
                setPoolTvl(tvlString);
            }
            if (feesTotalNow) {
                const feesTotalString = getFormattedNumber({
                    value: feesTotalNow,
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
        !!crocEnv,
        !!provider,
        poolIndex,
        pool.base.address + pool.quote.address,
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
        // poolApy,
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
