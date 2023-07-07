import { useEffect, useState, useContext } from 'react';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { AppStateContext } from '../../contexts/AppStateContext';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import { CachedDataContext } from '../../contexts/CachedDataContext';

import { topPoolIF } from '../../App/hooks/useTopPools';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import getUnicodeCharacter from '../../utils/functions/getUnicodeCharacter';
import { sortBaseQuoteTokens, toDisplayPrice } from '@crocswap-libs/sdk';
import { getMoneynessRank } from '../../utils/functions/getMoneynessRank';
import { getFormattedNumber } from '../functions/getFormattedNumber';
import { estimateFrom24HrRangeApr } from '../functions/fetchAprEst';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { get24hChange } from '../functions/getPoolStats';
import { linkGenMethodsIF, useLinkGen } from '../../utils/hooks/useLinkGen';
import { PoolIF } from '../../utils/interfaces/PoolIF';
type PoolStats = {
    poolName?: string;
    baseLogoUri?: string;
    quoteLogoUri?: string;
    poolPrice?: string;
    poolVolume?: string;
    poolTvl?: string;
    poolApy?: string;
    poolPriceChangePercent?: string;
    isPoolPriceChangePositive?: boolean;

    baseTokenCharacter?: string;
    quoteTokenCharacter?: string;

    poolLink: string;
};

const useFetchPoolStats = (pool: PoolIF): PoolStats => {
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

    const userData = useAppSelector((state) => state.userData);

    const [poolPriceDisplay, setPoolPriceDisplay] = useState<
        string | undefined
    >();
    const [shouldInvertDisplay, setShouldInvertDisplay] = useState<
        boolean | undefined
    >();

    const poolName = `${pool?.base.symbol} / ${pool?.quote.symbol}`;
    console.log('pool', pool);

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
        if (
            isServerEnabled &&
            !userData.isUserIdle &&
            crocEnv &&
            lastBlockNumber !== 0
        ) {
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
                        getMoneynessRank(
                            pool.base.address.toLowerCase() + '_' + chainId,
                        ) -
                            getMoneynessRank(
                                pool.quote.address.toLowerCase() +
                                    '_' +
                                    chainId,
                            ) >=
                        0;

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
    }, [
        isServerEnabled,
        userData.isUserIdle,
        lastBlockNumber,
        chainId,
        crocEnv,
    ]);

    const [poolVolume, setPoolVolume] = useState<string | undefined>(undefined);
    const [poolTvl, setPoolTvl] = useState<string | undefined>(undefined);
    const [poolApy, setPoolApy] = useState<string | undefined>(undefined);

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
                const volumeResult = poolStats?.volumeTotalUsd; // display the 24 hour volume
                const apyResult = await apyEst;

                if (tvlResult) {
                    const tvlString = getFormattedNumber({
                        value: tvlResult,
                        isTvl: true,
                    });
                    setPoolTvl(tvlString);
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
        tokenA: quoteAddr,
        tokenB: baseAddr,
    });

    useEffect(() => {
        if (isServerEnabled && !userData.isUserIdle) fetchPoolStats();
    }, [
        isServerEnabled,
        userData.isUserIdle,
        lastBlockNumber,
        shouldInvertDisplay,
    ]);
    return {
        poolName,
        baseLogoUri,
        quoteLogoUri,
        poolVolume,
        poolTvl,
        poolApy,
        poolPriceChangePercent,
        isPoolPriceChangePositive,
        baseTokenCharacter,
        quoteTokenCharacter,
        poolPrice,
        poolLink,
    };
};
export default useFetchPoolStats;
