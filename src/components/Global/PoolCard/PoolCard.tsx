import styles from './PoolCard.module.css';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sortBaseQuoteTokens, toDisplayPrice } from '@crocswap-libs/sdk';
import getUnicodeCharacter from '../../../utils/functions/getUnicodeCharacter';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { get24hChange } from '../../../App/functions/getPoolStats';
import { formatAmountOld } from '../../../utils/numbers';
import { getMoneynessRank } from '../../../utils/functions/getMoneynessRank';
import { topPoolIF } from '../../../App/hooks/useTopPools';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { useLinkGen, linkGenMethodsIF } from '../../../utils/hooks/useLinkGen';
import { CachedDataContext } from '../../../contexts/CachedDataContext';

interface propsIF {
    pool: topPoolIF;
}

export default function PoolCard(props: propsIF) {
    const { pool } = props;
    const {
        server: { isEnabled: isServerEnabled },
    } = useContext(AppStateContext);
    const { cachedPoolStatsFetch, cachedQuerySpotPrice } =
        useContext(CachedDataContext);
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

                    const displayPriceWithFormatting: string | undefined =
                        displayPriceWithInversion === undefined
                            ? undefined
                            : displayPriceWithInversion === 0
                            ? '0.00'
                            : displayPriceWithInversion < 0.001
                            ? displayPriceWithInversion.toExponential(2)
                            : displayPriceWithInversion < 0.5
                            ? displayPriceWithInversion.toPrecision(3)
                            : displayPriceWithInversion < 2
                            ? displayPriceWithInversion.toPrecision(6)
                            : displayPriceWithInversion >= 100000
                            ? formatAmountOld(displayPriceWithInversion, 1)
                            : // ? baseLiqDisplayNum.toExponential(2)
                              displayPriceWithInversion.toLocaleString(
                                  undefined,
                                  {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  },
                              );

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
                shouldInvertDisplay !== undefined
            ) {
                const poolStats = await cachedPoolStatsFetch(
                    chainId,
                    pool.base.address,
                    pool.quote.address,
                    poolIndex,
                    Math.floor(Date.now() / 60000),
                );

                const tvlResult = poolStats?.tvl;
                const volumeResult = poolStats?.volume; // display the 24 hour volume
                const apyResult = poolStats?.apy;

                if (tvlResult) {
                    const tvlString = formatAmountOld(tvlResult);
                    setPoolTvl(tvlString);
                }
                if (volumeResult) {
                    const volumeString = formatAmountOld(volumeResult);
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
                    if (priceChangeResult > -0.01 && priceChangeResult < 0.01) {
                        // setPoolPriceChangePercent('No Change');
                        setPoolPriceChangePercent('...');
                        setIsPoolPriceChangePositive(true);
                    } else if (priceChangeResult) {
                        priceChangeResult > 0
                            ? setIsPoolPriceChangePositive(true)
                            : setIsPoolPriceChangePositive(false);
                        const priceChangeString =
                            priceChangeResult > 0
                                ? '+' +
                                  priceChangeResult.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  }) +
                                  '%'
                                : priceChangeResult.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  }) + '%';
                        setPoolPriceChangePercent(priceChangeString);
                    } else {
                        setPoolPriceChangePercent(undefined);
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

    const tokenImagesDisplay = (
        <div className={styles.token_images}>
            <img
                src={
                    shouldInvertDisplay ? pool.base.logoURI : pool.quote.logoURI
                }
                alt={`logo for token ${
                    shouldInvertDisplay ? pool.base.logoURI : pool.quote.logoURI
                }`}
            />
            <img
                src={
                    shouldInvertDisplay ? pool.quote.logoURI : pool.base.logoURI
                }
                alt={`logo for token ${
                    shouldInvertDisplay ? pool.quote.name : pool.base.name
                }`}
            />
        </div>
    );

    const tokenNamesDisplay = (
        <div className={styles.tokens_name}>
            {shouldInvertDisplay
                ? `${pool.base.symbol} / ${pool.quote.symbol}`
                : `${pool.quote.symbol} / ${pool.base.symbol}`}
        </div>
    );

    const volumeDisplay = (
        <div className={styles.full_content}>
            <p />
            <div className={styles.half_content}>
                <p className={styles.row_title}>Vol.</p>
                <p className={styles.vol}>
                    {poolVolume === undefined ? '…' : `$${poolVolume}`}
                </p>
            </div>
        </div>
    );

    const apyDisplay = (
        <div className={styles.full_content}>
            <p />

            <div className={styles.half_content}>
                <p className={styles.row_title}>APY</p>
                <p className={styles.apr}>
                    {poolApy === undefined ? '…' : `${poolApy}%`}
                </p>
            </div>
        </div>
    );
    const poolPriceChangeDisplay = (
        <div className={styles.full_content}>
            <p className={styles.price}>
                {poolPriceDisplay === undefined
                    ? '…'
                    : shouldInvertDisplay
                    ? `${quoteTokenCharacter}${poolPriceDisplay}`
                    : `${baseTokenCharacter}${poolPriceDisplay}`}
            </p>
            <div className={styles.half_content}>
                <p className={styles.row_title}>24h </p>
                <p
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
                </p>
            </div>
        </div>
    );

    // const tvlDisplay = (
    //     <>
    //         <div></div>
    //         <div>
    //             <div className={styles.row_title}>TVL</div>
    //             <div className={styles.vol}>
    //                 {poolTvl === undefined ? '…' : `$${poolTvl}`}
    //             </div>
    //         </div>
    //     </>
    // );

    // const poolPriceDisplayDOM = (
    //     <div className={styles.price}>
    //         {poolPriceDisplay === undefined
    //             ? '…'
    //             : shouldInvertDisplay
    //             ? `${quoteTokenCharacter}${poolPriceDisplay}`
    //             : `${baseTokenCharacter}${poolPriceDisplay}`}
    //     </div>
    // );

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
                <div className={styles.row}>
                    {tokenImagesDisplay}
                    {tokenNamesDisplay}
                </div>
                {apyDisplay}
                {volumeDisplay}
                {poolPriceChangeDisplay}
            </div>
        </Link>
    );
}
