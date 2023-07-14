import styles from './PoolCard.module.css';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sortBaseQuoteTokens, toDisplayPrice } from '@crocswap-libs/sdk';
import getUnicodeCharacter from '../../../utils/functions/getUnicodeCharacter';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { get24hChange } from '../../../App/functions/getPoolStats';
import { getMoneynessRank } from '../../../utils/functions/getMoneynessRank';
import { topPoolIF } from '../../../App/hooks/useTopPools';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { useLinkGen, linkGenMethodsIF } from '../../../utils/hooks/useLinkGen';
import { CachedDataContext } from '../../../contexts/CachedDataContext';
import { estimateFrom24HrRangeApr } from '../../../App/functions/fetchAprEst';
import { getFormattedNumber } from '../../../App/functions/getFormattedNumber';
import TokenIcon from '../TokenIcon/TokenIcon';
import uriToHttp from '../../../utils/functions/uriToHttp';

interface propsIF {
    pool: topPoolIF;
}

export default function PoolCard(props: propsIF) {
    const { pool } = props;
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

    const baseTokenCharacter = poolPriceDisplay
        ? getUnicodeCharacter(pool.base.symbol)
        : '';
    const quoteTokenCharacter = poolPriceDisplay
        ? getUnicodeCharacter(pool.quote.symbol)
        : '';
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
        pool.base.address,
        pool.quote.address,
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
                    const apyString = apyResult.toLocaleString('en-US', {
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
                                  priceChangePercent.toLocaleString('en-US', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  }) +
                                  '%'
                                : priceChangePercent.toLocaleString('en-US', {
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

    useEffect(() => {
        if (isServerEnabled && !userData.isUserIdle) fetchPoolStats();
        // NOTE: we assume that a block occurs more frequently than once a minute
    }, [
        isServerEnabled,
        userData.isUserIdle,
        lastBlockNumber,
        shouldInvertDisplay,
    ]);

    const poolPriceDisplayDOM = (
        <div className={styles.price}>
            {poolPriceDisplay === undefined
                ? '…'
                : shouldInvertDisplay
                ? `${quoteTokenCharacter}${poolPriceDisplay}`
                : `${baseTokenCharacter}${poolPriceDisplay}`}
        </div>
    );

    const poolPriceChangeDisplay = (
        <div className={styles.pool_price_change}>
            <div className={styles.pool_price_title}>24h Δ</div>
            <div
                className={
                    isPoolPriceChangePositive
                        ? styles.change_positive
                        : styles.change_negative
                }
            >
                {poolPriceDisplay === undefined ||
                poolPriceChangePercent === undefined
                    ? '…'
                    : poolPriceChangePercent}
            </div>
        </div>
    );

    // hook to generate navigation actions with pre-loaded path
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');

    const ariaDescription = `pool for ${pool.base.symbol} and ${
        pool.quote.symbol
    }. 24 hour volume is ${poolVolume ? poolVolume : 'not available'}. APY is ${
        poolApy ? poolApy + '%' : 'not available'
    }. TVL is ${poolTvl}. 24 hours pool price change is ${poolPriceChangePercent}. Pool price is ${
        poolPriceDisplay ? poolPriceDisplay : 'not available'
    }. `;

    return (
        <Link
            className={styles.pool_card}
            to={linkGenMarket.getFullURL({
                chain: chainId,
                tokenA: quoteAddr,
                tokenB: baseAddr,
            })}
            tabIndex={0}
            role='presentation'
            aria-label={ariaDescription}
        >
            <div className={styles.main_container}>
                <div className={styles.row} style={{ padding: '4px' }}>
                    <div className={styles.token_images}>
                        <TokenIcon
                            size='2xl'
                            src={uriToHttp(
                                shouldInvertDisplay
                                    ? pool.base.logoURI
                                    : pool.quote.logoURI,
                            )}
                            alt={`logo for token ${
                                shouldInvertDisplay
                                    ? pool.base.logoURI
                                    : pool.quote.logoURI
                            }`}
                        />
                        <TokenIcon
                            size='2xl'
                            src={uriToHttp(
                                shouldInvertDisplay
                                    ? pool.quote.logoURI
                                    : pool.base.logoURI,
                            )}
                            alt={`logo for token ${
                                shouldInvertDisplay
                                    ? pool.quote.name
                                    : pool.base.name
                            }`}
                        />
                    </div>
                    <div className={styles.tokens_name}>
                        {shouldInvertDisplay
                            ? `${pool.base.symbol} / ${pool.quote.symbol}`
                            : `${pool.quote.symbol} / ${pool.base.symbol}`}
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.column}>
                        {poolPriceChangeDisplay}
                        {poolPriceDisplayDOM}
                    </div>
                    <div className={styles.column}>
                        <div className={styles.row}></div>
                        <div className={styles.row}>
                            <div className={styles.row_title}>24h APR</div>
                            <div className={styles.apr}>
                                {poolApy === undefined ? '…' : `${poolApy}%`}
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.row_title}>Volume</div>
                            <div className={styles.vol}>
                                {poolVolume === undefined
                                    ? '…'
                                    : `$${poolVolume}`}
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.row_title}>TVL</div>
                            <div className={styles.vol}>
                                {poolTvl === undefined ? '…' : `$${poolTvl}`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
