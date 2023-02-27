import { TokenIF } from '../../../utils/interfaces/exports';
import styles from './PoolCard.module.css';
// import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CrocEnv, sortBaseQuoteTokens, toDisplayPrice } from '@crocswap-libs/sdk';
import { SpotPriceFn } from '../../../App/functions/querySpotPrice';
import getUnicodeCharacter from '../../../utils/functions/getUnicodeCharacter';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { get24hChange, memoizePoolStats } from '../../../App/functions/getPoolStats';
import { formatAmountOld } from '../../../utils/numbers';
import PoolCardSkeleton from './PoolCardSkeleton/PoolCardSkeleton';
import { tradeData } from '../../../utils/state/tradeDataSlice';
import { getMoneynessRank } from '../../../utils/functions/getMoneynessRank';

const cachedPoolStatsFetch = memoizePoolStats();

interface propsIF {
    isServerEnabled: boolean;
    isUserIdle: boolean;
    crocEnv?: CrocEnv;
    tradeData: tradeData;
    cachedQuerySpotPrice: SpotPriceFn;
    name: string;
    tokenMap: Map<string, TokenIF>;
    baseToken: TokenIF;
    quoteToken: TokenIF;
    lastBlockNumber: number;
    chainId: string;
}

export default function PoolCard(props: propsIF) {
    const {
        isServerEnabled,
        isUserIdle,
        crocEnv,
        tradeData,
        tokenMap,
        baseToken,
        quoteToken,
        lastBlockNumber,
        chainId,
        cachedQuerySpotPrice,
    } = props;

    const baseTokenAddress = baseToken.address;
    const quoteTokenAddress = quoteToken.address;

    const baseTokenKey = baseTokenAddress?.toLowerCase() + '_0x' + baseToken?.chainId.toString();
    const quoteTokenKey = quoteTokenAddress?.toLowerCase() + '_0x' + quoteToken?.chainId.toString();

    const baseTokenFromMap = tokenMap && baseToken?.address ? tokenMap.get(baseTokenKey) : null;

    const quoteTokenFromMap = tokenMap && quoteToken?.address ? tokenMap.get(quoteTokenKey) : null;

    const [poolPriceDisplay, setPoolPriceDisplay] = useState<string | undefined>();
    const [shouldInvertDisplay, setShouldInvertDisplay] = useState<boolean | undefined>();

    const baseTokenCharacter =
        baseToken && poolPriceDisplay ? getUnicodeCharacter(baseToken?.symbol) : '';
    const quoteTokenCharacter =
        quoteToken && poolPriceDisplay ? getUnicodeCharacter(quoteToken?.symbol) : '';
    // useEffect to get spot price when tokens change and block updates
    useEffect(() => {
        if (
            isServerEnabled &&
            !isUserIdle &&
            crocEnv &&
            baseTokenAddress &&
            quoteTokenAddress &&
            baseToken?.decimals &&
            quoteToken?.decimals &&
            lastBlockNumber !== 0
        ) {
            (async () => {
                const spotPrice = await cachedQuerySpotPrice(
                    crocEnv,
                    baseToken.address,
                    quoteToken.address,
                    chainId,
                    lastBlockNumber,
                );

                if (spotPrice) {
                    const displayPrice = toDisplayPrice(
                        spotPrice,
                        baseToken.decimals,
                        quoteToken.decimals,
                    );

                    const isBaseTokenMoneynessGreaterOrEqual =
                        getMoneynessRank(baseTokenAddress.toLowerCase() + '_' + chainId) -
                            getMoneynessRank(quoteTokenAddress.toLowerCase() + '_' + chainId) >=
                        0;

                    const shouldInvertDisplay = !isBaseTokenMoneynessGreaterOrEqual;

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
                              displayPriceWithInversion.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                              });

                    setPoolPriceDisplay(displayPriceWithFormatting);
                } else {
                    setPoolPriceDisplay(undefined);
                }
            })();
        }
    }, [isServerEnabled, isUserIdle, lastBlockNumber, baseToken, quoteToken, chainId, crocEnv]);

    const [poolVolume, setPoolVolume] = useState<string | undefined>(undefined);
    const [poolTvl, setPoolTvl] = useState<string | undefined>(undefined);
    const [poolApy, setPoolApy] = useState<string | undefined>(undefined);

    const [poolPriceChangePercent, setPoolPriceChangePercent] = useState<string | undefined>();

    const [isPoolPriceChangePositive, setIsPoolPriceChangePositive] = useState<boolean>(true);

    const poolIndex = lookupChain(chainId).poolIndex;

    const fetchPoolStats = () => {
        (async () => {
            if (
                baseTokenAddress &&
                quoteTokenAddress &&
                poolIndex &&
                chainId &&
                lastBlockNumber &&
                shouldInvertDisplay !== undefined
            ) {
                const poolStats = await cachedPoolStatsFetch(
                    chainId,
                    baseTokenAddress,
                    quoteTokenAddress,
                    poolIndex,
                    Math.floor(lastBlockNumber / 4),
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

                const sortedTokens = sortBaseQuoteTokens(baseTokenAddress, quoteTokenAddress);

                try {
                    const priceChangeResult = await get24hChange(
                        chainId,
                        sortedTokens[0],
                        sortedTokens[1],
                        poolIndex,
                        shouldInvertDisplay,
                    );
                    if (priceChangeResult > -0.01 && priceChangeResult < 0.01) {
                        setPoolPriceChangePercent('No Change');
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
        // console.log({ isUserIdle });
        if (isServerEnabled && !isUserIdle) fetchPoolStats();
    }, [isServerEnabled, isUserIdle, lastBlockNumber, shouldInvertDisplay]);

    const tokenImagesDisplay = (
        <div className={styles.token_images}>
            <img
                src={shouldInvertDisplay ? baseTokenFromMap?.logoURI : quoteTokenFromMap?.logoURI}
                alt=''
            />
            <img
                src={shouldInvertDisplay ? quoteTokenFromMap?.logoURI : baseTokenFromMap?.logoURI}
                alt=''
            />
        </div>
    );

    const tokenNamesDisplay = (
        <div className={styles.tokens_name}>
            {shouldInvertDisplay
                ? `${baseToken.symbol} / ${quoteToken.symbol}`
                : `${quoteToken.symbol} / ${baseToken.symbol}`}
        </div>
    );

    const apyDisplay = (
        <>
            <div></div>
            <div>
                <div className={styles.row_title}>24h APR</div>
                <div className={styles.apr}>{poolApy === undefined ? '…' : `${poolApy}%`}</div>
            </div>
        </>
    );

    const volumeDisplay = (
        <>
            <div></div>
            <div>
                <div className={styles.row_title}>24h Vol.</div>
                <div className={styles.vol}>
                    {poolVolume === undefined ? '…' : `$${poolVolume}`}
                </div>
            </div>
        </>
    );

    const tvlDisplay = (
        <>
            <div></div>
            <div>
                <div className={styles.row_title}>TVL</div>
                <div className={styles.vol}>{poolTvl === undefined ? '…' : `$${poolTvl}`}</div>
            </div>
        </>
    );

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
                    isPoolPriceChangePositive ? styles.change_positive : styles.change_negative
                }
            >
                {poolPriceDisplay === undefined || poolPriceChangePercent === undefined
                    ? '…'
                    : poolPriceChangePercent}
            </div>
        </div>
    );

    if (!baseToken || !quoteToken) return <PoolCardSkeleton />;

    const baseTokenString =
        baseToken.address.toLowerCase() === tradeData.quoteToken.address.toLowerCase()
            ? quoteToken.address
            : baseToken.address;

    const quoteTokenString =
        baseToken.address.toLowerCase() === tradeData.quoteToken.address.toLowerCase()
            ? baseToken.address
            : quoteToken.address;

    const linkpath =
        '/trade/market/chain=0x5&tokenA=' + quoteTokenString + '&tokenB=' + baseTokenString;

    return (
        <Link className={styles.pool_card} to={linkpath}>
            <div className={styles.main_container}>
                <div className={styles.row}>
                    {tokenImagesDisplay}
                    {tokenNamesDisplay}
                </div>
                <div className={styles.row}>{volumeDisplay}</div>
                <div className={styles.row}>{apyDisplay}</div>
                <div className={styles.row}>{tvlDisplay}</div>
                <div className={styles.column}>
                    {poolPriceChangeDisplay}
                    {poolPriceDisplayDOM}
                </div>
            </div>
        </Link>
    );
}
