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
import { ZERO_ADDRESS } from '../../ambient-utils/constants';
import { TokenContext } from '../../contexts/TokenContext';
import { TradeDataContext } from '../../contexts/TradeDataContext';

const useFetchPoolStats = (
    pool: PoolIF,
    poolList: PoolIF[] | undefined,
    enableTotalSupply = false,
    didUserFlipDenom = false,
): PoolStatIF => {
    const {
        server: { isEnabled: isServerEnabled },
        isUserIdle,
        isTradeRoute,
    } = useContext(AppStateContext);

    const {
        // cachedPoolStatsFetch,
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
    } = useContext(CachedDataContext);

    const { setPoolPriceNonDisplay, setLimitTick, contextMatchesParams } =
        useContext(TradeDataContext);

    const [intermediatePoolPrice, setIntermediatePoolPrice] = useState<
        | {
              price: number | undefined;
              baseAddress: string;
              quoteAddress: string;
              chainId: string;
          }
        | undefined
    >();

    const [
        intermediatePoolPriceNotActivePool,
        setIntermediatePoolPriceNotActivePool,
    ] = useState<boolean>(false);

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

    const { isActiveNetworkMonad, lastBlockNumber } =
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

    const [isPoolInitialized, setIsPoolInitialized] = useState<boolean>();

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

    const poolPriceCacheTime =
        isUserIdle || isActiveNetworkMonad
            ? Math.floor(Date.now() / 30000) // 30 second interval if  idle
            : Math.floor(Date.now() / 5000); // 5 second cache for trade pair

    const analyticsServerShowsPoolInitialized =
        activeTradePoolStats !== undefined &&
        (activeTradePoolStats.lastPriceSwap !== undefined ||
            activeTradePoolStats.quoteTvl !== undefined ||
            activeTradePoolStats.baseTvl !== undefined);

    // useEffect to get spot price when tokens change and block updates
    useEffect(() => {
        if (
            isServerEnabled &&
            crocEnv &&
            lastBlockNumber !== 0 &&
            isTradeRoute &&
            contextMatchesParams
        ) {
            (async () => {
                if (
                    !crocEnv ||
                    (await crocEnv.context).chain.chainId !== pool.chainId ||
                    pool.chainId !== chainId
                ) {
                    return;
                }

                if (analyticsServerShowsPoolInitialized) {
                    setIsPoolInitialized(true);
                }

                async function getSpotPriceWithImmediateRetry(): Promise<
                    number | undefined
                > {
                    while (true && crocEnv) {
                        const result = await Promise.race([
                            cachedQuerySpotPrice(
                                crocEnv,
                                pool.base,
                                pool.quote,
                                pool.chainId,
                                poolPriceCacheTime,
                            ),
                            new Promise<number | undefined>((resolve) =>
                                setTimeout(() => {
                                    resolve(undefined);
                                }, 5000),
                            ),
                        ]);
                        if (result !== undefined) return result; // Success, return value
                        // If result is undefined, loop continues and retries immediately
                        await new Promise((res) => setTimeout(res, 1000)); // Added delay
                    }
                }

                const cachedSpotPrice: number | undefined =
                    await getSpotPriceWithImmediateRetry();

                const spotPrice =
                    cachedSpotPrice !== undefined
                        ? cachedSpotPrice
                        : activeTradePoolStats
                          ? activeTradePoolStats.lastPriceSwap
                          : undefined;

                if (spotPrice !== intermediatePoolPrice?.price) {
                    setIntermediatePoolPrice({
                        price: spotPrice,
                        baseAddress: pool.base,
                        quoteAddress: pool.quote,
                        chainId: pool.chainId,
                    });
                }
            })();
        }
    }, [
        isServerEnabled,
        chainId,
        crocEnv,
        pool.base,
        pool.quote,
        pool.chainId,
        lastBlockNumber !== 0,
        poolPriceCacheTime,
        isTradeRoute,
        analyticsServerShowsPoolInitialized,
        intermediatePoolPriceNotActivePool,
        contextMatchesParams,
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

    const [isPoolPriceChangePositive, setIsPoolPriceChangePositive] = useState<
        boolean | undefined
    >();

    const poolIndex = lookupChain(chainId).poolIndex;

    const [basePrice, setBasePrice] = useState<number | undefined>();
    const [quotePrice, setQuotePrice] = useState<number | undefined>();

    // Reset pool metric states that require asynchronous updates when pool changes
    const resetPoolStats = () => {
        setBasePrice(undefined);
        setQuotePrice(undefined);
        setPoolPriceDisplayNum(undefined);
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
        setIsPoolPriceChangePositive(undefined);
        setPoolFees24h(undefined);
        setApr(undefined);
        setIntermediatePoolPriceNotActivePool(false);
        setIntermediatePoolPrice(undefined);
        if (!location.pathname.includes('limitTick')) {
            setLimitTick(undefined);
        }
    };

    useEffect(() => {
        resetPoolStats();
    }, [pool.base + pool.quote + pool.chainId]);

    const [intermediateBasePrice, setIntermediateBasePrice] = useState<
        { price: number; address: string; chainId: string } | undefined
    >();

    const [intermediateQuotePrice, setIntermediateQuotePrice] = useState<
        { price: number; address: string; chainId: string } | undefined
    >();

    useEffect(() => {
        if (
            intermediateBasePrice &&
            intermediateBasePrice.address.toLowerCase() ===
                pool.base.toLowerCase() &&
            intermediateBasePrice.chainId === pool.chainId
        ) {
            setBasePrice(intermediateBasePrice.price);
        }
        if (
            intermediateQuotePrice &&
            intermediateQuotePrice.address.toLowerCase() ===
                pool.quote.toLowerCase() &&
            intermediateQuotePrice.chainId === pool.chainId
        ) {
            setQuotePrice(intermediateQuotePrice.price);
        }
        if (
            intermediatePoolPrice?.baseAddress.toLowerCase() ===
                pool.base.toLowerCase() &&
            intermediatePoolPrice?.quoteAddress.toLowerCase() ===
                pool.quote.toLowerCase() &&
            intermediatePoolPrice?.chainId === pool.chainId
        ) {
            setIntermediatePoolPriceNotActivePool(false);
            if (intermediatePoolPrice.price) {
                setIsPoolInitialized(true);
                setLocalPoolPriceNonDisplay([
                    pool.base + pool.quote,
                    intermediatePoolPrice.price,
                ]);

                const displayPrice = toDisplayPrice(
                    intermediatePoolPrice.price,
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
                setPoolPriceNonDisplay(intermediatePoolPrice.price);
            } else {
                setPoolPriceDisplay(undefined);
                setLocalPoolPriceNonDisplay(undefined);
                setPoolPriceDisplayNum(undefined);
                if (!analyticsServerShowsPoolInitialized) {
                    setIsPoolInitialized(false);
                }
            }
        } else if (intermediatePoolPrice?.price !== undefined) {
            setIntermediatePoolPriceNotActivePool(true);
        }
    }, [
        intermediateBasePrice,
        intermediateQuotePrice,
        intermediatePoolPrice,
        pool.base,
        pool.quote,
        pool.chainId,
    ]);

    const activeTradePoolStatsMatchesPool =
        activeTradePoolStats?.base.toLowerCase() === pool.base.toLowerCase() &&
        activeTradePoolStats?.quote.toLowerCase() ===
            pool.quote.toLowerCase() &&
        activeTradePoolStats?.chainId.toLowerCase() ===
            pool.chainId.toLowerCase();

    useEffect(() => {
        (async () => {
            let baseTokenPrice, quoteTokenPrice;
            if (
                activeTradePoolStatsMatchesPool &&
                activeTradePoolStats?.baseUsdPrice
            ) {
                baseTokenPrice = activeTradePoolStats.baseUsdPrice;
            } else {
                baseTokenPrice =
                    (await cachedFetchTokenPrice(pool.base, pool.chainId))
                        ?.usdPrice || 0.0;
            }
            if (
                activeTradePoolStatsMatchesPool &&
                activeTradePoolStats?.quoteUsdPrice
            ) {
                quoteTokenPrice = activeTradePoolStats.quoteUsdPrice;
            } else {
                quoteTokenPrice =
                    (await cachedFetchTokenPrice(pool.quote, pool.chainId))
                        ?.usdPrice || 0.0;
            }
            if (baseTokenPrice) {
                setIntermediateBasePrice({
                    price: baseTokenPrice,
                    address: pool.base,
                    chainId: pool.chainId,
                });
            } else if (isETHorStakedEthToken(pool.base, pool.chainId)) {
                const fetchedBaseTokenPrice = (
                    await cachedFetchTokenPrice(ZERO_ADDRESS, chainId)
                )?.usdPrice;
                setIntermediateBasePrice({
                    price: fetchedBaseTokenPrice || 1,
                    address: pool.base,
                    chainId: pool.chainId,
                });
            } else if (poolPriceDisplayNum && quoteTokenPrice) {
                // calculation of estimated base price below may be backwards;
                // having a hard time finding an example of base missing a price
                const estimatedBasePrice =
                    quoteTokenPrice / poolPriceDisplayNum;
                setIntermediateBasePrice({
                    price: estimatedBasePrice,
                    address: pool.base,
                    chainId: pool.chainId,
                });
            } else {
                setIntermediateBasePrice(undefined);
            }
            if (quoteTokenPrice) {
                setIntermediateQuotePrice({
                    price: quoteTokenPrice,
                    address: pool.quote,
                    chainId: pool.chainId,
                });
            } else if (isETHorStakedEthToken(pool.quote, pool.chainId)) {
                const fetchedTokenPrice =
                    (await cachedFetchTokenPrice(ZERO_ADDRESS, chainId))
                        ?.usdPrice || 1;

                setIntermediateQuotePrice({
                    price: fetchedTokenPrice,
                    address: pool.quote,
                    chainId: pool.chainId,
                });
            } else if (poolPriceDisplayNum && baseTokenPrice) {
                const estimatedQuotePrice =
                    baseTokenPrice * poolPriceDisplayNum;
                setIntermediateQuotePrice({
                    price: estimatedQuotePrice,
                    address: pool.quote,
                    chainId: pool.chainId,
                });
            } else {
                setIntermediateQuotePrice(undefined);
            }
        })();
    }, [
        pool.base,
        pool.quote,
        pool.chainId,
        activeTradePoolStatsMatchesPool,
        activeTradePoolStats?.baseUsdPrice,
        activeTradePoolStats?.quoteUsdPrice,
        poolPriceDisplayNum,
    ]);

    const [prevPoolPrice, setPrevPoolPrice] = useState<number | undefined>();

    const fetchPoolStats = async () => {
        if (
            activeTradePoolStats &&
            lastBlockNumber &&
            shouldInvertDisplay !== undefined &&
            crocEnv &&
            provider &&
            localPoolPriceNonDisplay !== undefined &&
            localPoolPriceNonDisplay[0] === pool.base + pool.quote
        ) {
            const lastPriceSwap = activeTradePoolStats?.lastPriceSwap;

            if (prevPoolPrice && lastPriceSwap) {
                const priceChange = Math.abs(
                    (lastPriceSwap - prevPoolPrice) / prevPoolPrice,
                );
                if (priceChange < 0.0002) {
                    // Price change < 0.02%, skipping fetch
                    return;
                }
            }

            setPrevPoolPrice(lastPriceSwap);

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

            if (isTradeRoute) {
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
                    setIsPoolPriceChangePositive(undefined);
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
        chain: pool.chainId,
        tokenA: pool.base,
        tokenB: pool.quote,
    });

    useEffect(() => {
        if (isServerEnabled && lastBlockNumber !== 0 && isTradeRoute)
            fetchPoolStats();
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
        isTradeRoute,
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
        activeTradePoolStats,
    };
};
export default useFetchPoolStats;
