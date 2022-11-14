import { TokenIF } from '../../../utils/interfaces/TokenIF';
import styles from './PoolCard.module.css';
// import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CrocEnv, toDisplayPrice } from '@crocswap-libs/sdk';
import { SpotPriceFn } from '../../../App/functions/querySpotPrice';
import getUnicodeCharacter from '../../../utils/functions/getUnicodeCharacter';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { get24hChange, memoizePoolStats } from '../../../App/functions/getPoolStats';
import { formatAmountOld } from '../../../utils/numbers';
import PoolCardSkeleton from './PoolCardSkeleton/PoolCardSkeleton';
import { tradeData } from '../../../utils/state/tradeDataSlice';

const cachedPoolStatsFetch = memoizePoolStats();

interface PoolCardProps {
    isServerEnabled: boolean;
    isUserIdle: boolean;
    crocEnv?: CrocEnv;
    tradeData: tradeData;
    cachedQuerySpotPrice: SpotPriceFn;
    name: string;
    tokenMap: Map<string, TokenIF>;
    tokenA: TokenIF;
    tokenB: TokenIF;
    lastBlockNumber: number;
    chainId: string;
}

export default function PoolCard(props: PoolCardProps) {
    const {
        isServerEnabled,
        isUserIdle,
        crocEnv,
        tradeData,
        tokenMap,
        tokenA,
        tokenB,
        lastBlockNumber,
        chainId,
        cachedQuerySpotPrice,
    } = props;

    const tokenAAddress = tokenA.address;
    const tokenBAddress = tokenB.address;

    const tokenAKey = tokenAAddress?.toLowerCase() + '_0x' + tokenA?.chainId.toString();
    const tokenBKey = tokenBAddress?.toLowerCase() + '_0x' + tokenB?.chainId.toString();

    const tokenAFromMap = tokenMap && tokenA?.address ? tokenMap.get(tokenAKey) : null;

    const tokenBFromMap = tokenMap && tokenB?.address ? tokenMap.get(tokenBKey) : null;

    const [poolPriceDisplay, setPoolPriceDisplay] = useState<string | undefined>();
    const [shouldInvertDisplay, setShouldInvertDisplay] = useState(true);

    const tokenACharacter = tokenA && poolPriceDisplay ? getUnicodeCharacter(tokenA?.symbol) : '';
    const tokenBCharacter = tokenB && poolPriceDisplay ? getUnicodeCharacter(tokenB?.symbol) : '';
    // useEffect to get spot price when tokens change and block updates
    useEffect(() => {
        if (
            isServerEnabled &&
            !isUserIdle &&
            crocEnv &&
            tokenAAddress &&
            tokenBAddress &&
            tokenA?.decimals &&
            tokenB?.decimals &&
            lastBlockNumber !== 0
        ) {
            (async () => {
                const spotPrice = await cachedQuerySpotPrice(
                    crocEnv,
                    tokenA.address,
                    tokenB.address,
                    chainId,
                    lastBlockNumber,
                );

                if (spotPrice) {
                    const displayPrice = toDisplayPrice(
                        spotPrice,
                        tokenA.decimals,
                        tokenB.decimals,
                    );

                    const shouldInvertDisplay = displayPrice < 1;

                    setShouldInvertDisplay(shouldInvertDisplay);

                    const displayPriceWithInversion = shouldInvertDisplay
                        ? 1 / displayPrice
                        : displayPrice;

                    const displayPriceWithFormatting =
                        displayPriceWithInversion < 2
                            ? displayPriceWithInversion.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 6,
                              })
                            : displayPriceWithInversion.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                              });
                    setPoolPriceDisplay(displayPriceWithFormatting);
                } else {
                    setPoolPriceDisplay(undefined);
                }
            })();
        }
    }, [isServerEnabled, isUserIdle, lastBlockNumber, tokenA, tokenB, chainId, crocEnv]);

    const [poolVolume, setPoolVolume] = useState<string | undefined>(undefined);
    const [poolTvl, setPoolTvl] = useState<string | undefined>(undefined);
    const [poolApy, setPoolApy] = useState<string | undefined>(undefined);

    const [poolPriceChangePercent, setPoolPriceChangePercent] = useState<string | undefined>();

    const [isPoolPriceChangePositive, setIsPoolPriceChangePositive] = useState<boolean>(true);

    const poolIndex = lookupChain(chainId).poolIndex;

    const fetchPoolStats = () => {
        (async () => {
            if (tokenAAddress && tokenBAddress && poolIndex && chainId && lastBlockNumber) {
                const poolStats = await cachedPoolStatsFetch(
                    chainId,
                    tokenAAddress,
                    tokenBAddress,
                    poolIndex,
                    Math.floor(lastBlockNumber / 4),
                );

                const tvlResult = poolStats?.tvl;
                const volumeResult = poolStats?.volume;
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
                        tokenAAddress,
                        tokenBAddress,
                        poolIndex,
                        true, // denomInBase
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
    }, [isServerEnabled, isUserIdle, lastBlockNumber]);

    const tokenImagesDisplay = (
        <div className={styles.token_images}>
            <img
                src={shouldInvertDisplay ? tokenAFromMap?.logoURI : tokenBFromMap?.logoURI}
                alt=''
            />
            <img
                src={shouldInvertDisplay ? tokenBFromMap?.logoURI : tokenAFromMap?.logoURI}
                alt=''
            />
        </div>
    );

    const tokenNamesDisplay = (
        <div className={styles.tokens_name}>
            {shouldInvertDisplay
                ? `${tokenA.symbol} / ${tokenB.symbol}`
                : `${tokenB.symbol} / ${tokenA.symbol}`}
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
                ? `${tokenBCharacter}${poolPriceDisplay}`
                : `${tokenACharacter}${poolPriceDisplay}`}
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

    if (!tokenA || !tokenB) return <PoolCardSkeleton />;

    const tokenAString =
        tokenA.address.toLowerCase() === tradeData.tokenB.address.toLowerCase()
            ? tokenB.address
            : tokenA.address;

    const tokenBString =
        tokenA.address.toLowerCase() === tradeData.tokenB.address.toLowerCase()
            ? tokenA.address
            : tokenB.address;

    const linkpath = '/trade/market/chain=0x5&tokenA=' + tokenAString + '&tokenB=' + tokenBString;

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
