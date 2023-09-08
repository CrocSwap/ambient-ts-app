import { useEffect, useState, useContext } from 'react';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { AppStateContext } from '../../contexts/AppStateContext';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import { CachedDataContext } from '../../contexts/CachedDataContext';

import getUnicodeCharacter from '../../utils/functions/getUnicodeCharacter';
import { sortBaseQuoteTokens, toDisplayPrice } from '@crocswap-libs/sdk';
import { getMoneynessRank } from '../../utils/functions/getMoneynessRank';
import { getFormattedNumber } from '../functions/getFormattedNumber';
import { estimateFrom24HrRangeApr } from '../functions/fetchAprEst';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { get24hChange } from '../functions/getPoolStats';
import { linkGenMethodsIF, useLinkGen } from '../../utils/hooks/useLinkGen';
import { PoolIF } from '../../utils/interfaces/PoolIF';
import { PoolStatIF } from '../../utils/interfaces/PoolStatIF';

const useFetchPoolStats = (pool: PoolIF): PoolStatIF => {
    const {
        server: { isEnabled: isServerEnabled },
    } = useContext(AppStateContext);
    const {
        cachedPoolStatsFetch,
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
    } = useContext(CachedDataContext);
    const {
        crocEnv,
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);

    const [poolPriceDisplay, setPoolPriceDisplay] = useState<
        string | undefined
    >();
    const [shouldInvertDisplay, setShouldInvertDisplay] = useState<
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

    // useEffect to get spot price when tokens change and block updates
    useEffect(() => {
        if (isServerEnabled && crocEnv && lastBlockNumber !== 0) {
            (async () => {
                const spotPrice = await cachedQuerySpotPrice(
                    crocEnv,
                    pool.base.address,
                    pool.quote.address,
                    chainId,
                    lastBlockNumber,
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

    const [poolVolume, setPoolVolume] = useState<string | undefined>(undefined);
    const [poolTvl, setPoolTvl] = useState<string | undefined>(undefined);
    const [poolFeesTotal, setPoolFeesTotal] = useState<string | undefined>(
        undefined,
    );
    const [poolApy, setPoolApy] = useState<string | undefined>(undefined);
    const [quoteTvlDecimal, setQuoteTvlDecimal] = useState<number | undefined>(
        undefined,
    );
    const [baseTvlDecimal, setBaseTvlDecimal] = useState<number | undefined>(
        undefined,
    );
    const [quoteTvlUsd, setQuoteTvlUsd] = useState<number | undefined>(
        undefined,
    );
    const [baseTvlUsd, setBaseTvlUsd] = useState<number | undefined>(undefined);

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
        setPoolTvl(undefined);
        setPoolFeesTotal(undefined);
        setPoolApy(undefined);
        setQuoteTvlDecimal(undefined);
        setBaseTvlDecimal(undefined);
        setQuoteTvlUsd(undefined);
        setBaseTvlUsd(undefined);
        setPoolPriceChangePercent(undefined);
        setIsPoolPriceChangePositive(true);
    };

    useEffect(() => {
        resetPoolStats();
    }, [JSON.stringify(pool)]);

    const fetchPoolStats = () => {
        (async () => {
            if (
                poolIndex &&
                chainId &&
                lastBlockNumber &&
                shouldInvertDisplay !== undefined &&
                crocEnv
            ) {
                const RANGE_WIDTH = 0.1;

                const apyEst = estimateFrom24HrRangeApr(
                    RANGE_WIDTH,
                    pool.base.address,
                    pool.quote.address,
                    crocEnv,
                    lastBlockNumber,
                );

                const poolStats = await cachedPoolStatsFetch(
                    chainId,
                    pool.base.address,
                    pool.quote.address,
                    poolIndex,
                    Math.floor(Date.now() / 60000),
                    crocEnv,
                    cachedFetchTokenPrice,
                );

                const tvlResult = poolStats?.tvlTotalUsd;
                const feesTotalResult = poolStats?.feesTotalUsd;
                const volumeResult = poolStats?.volumeTotalUsd; // display the 24 hour volume
                const apyResult = await apyEst;

                setQuoteTvlDecimal(poolStats.quoteTvlDecimal);
                setBaseTvlDecimal(poolStats.baseTvlDecimal);
                setQuoteTvlUsd(poolStats.quoteTvlUsd);
                setBaseTvlUsd(poolStats.baseTvlUsd);

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
                if (apyResult) {
                    const apyString = apyResult.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    });
                    setPoolApy(apyString);
                }

                try {
                    const priceChangeResult = await get24hChange(
                        chainId,
                        baseAddr,
                        quoteAddr,
                        poolIndex,
                        shouldInvertDisplay,
                    );

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

    useEffect(() => {
        if (isServerEnabled) fetchPoolStats();
    }, [
        isServerEnabled,
        shouldInvertDisplay,
        lastBlockNumber,
        crocEnv,
        poolIndex,
    ]);

    return {
        baseLogoUri,
        quoteLogoUri,
        poolVolume,
        poolTvl,
        poolFeesTotal,
        poolApy,
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
