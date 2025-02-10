import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    getFormattedNumber,
    isBtcPair,
    isDefaultDenomTokenExcludedFromUsdConversion,
    isETHPair,
    isUsdStableToken,
    isWbtcOrStakedBTCToken,
    uriToHttp,
} from '../../../ambient-utils/dataLayer';
import { PoolIF } from '../../../ambient-utils/types';
import useFetchPoolStats from '../../../App/hooks/useFetchPoolStats';
import { AppStateContext, PoolContext } from '../../../contexts';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { linkGenMethodsIF, useLinkGen } from '../../../utils/hooks/useLinkGen';
import TokenIcon from '../TokenIcon/TokenIcon';
import styles from './PoolCard.module.css';

interface propsIF {
    pool: PoolIF;
    spotPrice: number | undefined;
}

export default function PoolCard(props: propsIF) {
    const { pool, spotPrice } = props;

    const navigate = useNavigate();

    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);

    const { poolList } = useContext(PoolContext);
    const { tokenA, tokenB } = useContext(TradeDataContext);

    const [isHovered, setIsHovered] = useState(false);

    const poolData = useFetchPoolStats(pool, poolList, spotPrice);

    const {
        poolVolume24h,
        poolPrice,
        poolPriceDisplay,
        poolTvl,
        poolPriceChangePercent,
        isPoolPriceChangePositive,
        shouldInvertDisplay,
        basePrice,
        quotePrice,
    } = poolData;

    const denomTokenIsUsdStableToken = shouldInvertDisplay
        ? isUsdStableToken(pool.quote.address)
        : isUsdStableToken(pool.base.address);

    const denomTokenIsWBTCToken = shouldInvertDisplay
        ? isWbtcOrStakedBTCToken(pool.quote.address)
        : isWbtcOrStakedBTCToken(pool.base.address);

    const excludeFromUsdConversion =
        isDefaultDenomTokenExcludedFromUsdConversion(
            pool.base.address,
            pool.quote.address,
        );

    const isEthStakedEthPair = isETHPair(pool.base.address, pool.quote.address);
    const isPoolBtcPair = isBtcPair(pool.base.address, pool.quote.address);

    const usdPrice =
        poolPriceDisplay && basePrice && quotePrice
            ? shouldInvertDisplay
                ? (1 / poolPriceDisplay) * quotePrice
                : poolPriceDisplay * basePrice
            : undefined;

    const poolPriceDisplayDOM = (
        <div className={styles.price}>
            {poolPrice === undefined
                ? '…'
                : isHovered || denomTokenIsUsdStableToken
                  ? denomTokenIsWBTCToken ||
                    isEthStakedEthPair ||
                    isPoolBtcPair ||
                    excludeFromUsdConversion
                      ? `${
                            usdPrice
                                ? getFormattedNumber({
                                      value: usdPrice,
                                      prefix: '$',
                                  })
                                : '…'
                        }`
                      : poolPrice
                  : denomTokenIsWBTCToken ||
                      isEthStakedEthPair ||
                      isPoolBtcPair ||
                      excludeFromUsdConversion
                    ? poolPrice
                    : `${
                          usdPrice
                              ? getFormattedNumber({
                                    value: usdPrice,
                                    prefix: '$',
                                })
                              : '…'
                      }`}
        </div>
    );

    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');

    const [addrTokenA, addrTokenB] =
        tokenA.address.toLowerCase() === pool.base.address.toLowerCase()
            ? [pool.base.address, pool.quote.address]
            : tokenA.address.toLowerCase() === pool.quote.address.toLowerCase()
              ? [pool.quote.address, pool.base.address]
              : tokenB.address.toLowerCase() === pool.base.address.toLowerCase()
                ? [pool.quote.address, pool.base.address]
                : [pool.base.address, pool.quote.address];

    const poolLink = linkGenMarket.getFullURL({
        chain: chainId,
        tokenA: addrTokenA,
        tokenB: addrTokenB,
    });

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
                {poolPrice === undefined || poolPriceChangePercent === undefined
                    ? '…'
                    : poolPriceChangePercent}
            </div>
        </div>
    );

    const ariaDescription = `pool for ${pool.base.symbol} and ${
        pool.quote.symbol
    }. 24 hour volume is ${
        poolVolume24h ? poolVolume24h : 'not available'
    }.  TVL is ${poolTvl}. 24 hours pool price change is ${poolPriceChangePercent}. Pool price is ${
        poolPrice ? poolPrice : 'not available'
    }. `;

    return (
        <Link
            className={styles.pool_card}
            to={poolLink}
            tabIndex={0}
            role='presentation'
            aria-label={ariaDescription}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={() => {
                navigate(poolLink);
            }}
        >
            <div className={styles.main_container}>
                <div className={styles.row} style={{ padding: '4px' }}>
                    <div className={styles.token_images}>
                        <TokenIcon
                            token={
                                shouldInvertDisplay === undefined
                                    ? pool.base
                                    : shouldInvertDisplay
                                      ? pool.base
                                      : pool.quote
                            }
                            size='2xl'
                            src={uriToHttp(
                                shouldInvertDisplay === undefined
                                    ? pool.base.logoURI
                                    : shouldInvertDisplay
                                      ? pool.base.logoURI
                                      : pool.quote.logoURI,
                            )}
                            alt={
                                shouldInvertDisplay === undefined
                                    ? pool.base.symbol
                                    : shouldInvertDisplay
                                      ? pool.base.symbol
                                      : pool.quote.symbol
                            }
                        />
                        <TokenIcon
                            token={
                                shouldInvertDisplay === undefined
                                    ? pool.quote
                                    : shouldInvertDisplay
                                      ? pool.quote
                                      : pool.base
                            }
                            size='2xl'
                            src={uriToHttp(
                                shouldInvertDisplay === undefined
                                    ? pool.quote.logoURI
                                    : shouldInvertDisplay
                                      ? pool.quote.logoURI
                                      : pool.base.logoURI,
                            )}
                            alt={
                                shouldInvertDisplay === undefined
                                    ? pool.quote.symbol
                                    : shouldInvertDisplay
                                      ? pool.quote.symbol
                                      : pool.base.symbol
                            }
                        />
                    </div>
                    <div className={styles.tokens_name}>
                        {shouldInvertDisplay === undefined
                            ? `${pool.base.symbol} / ${pool.quote.symbol}`
                            : shouldInvertDisplay
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
                        {/*
                            // code is temporarily disabled pending
                            // ... new back-end data handling logic
                        <div className={styles.row}>
                            <div className={styles.row_title}>24h APR</div>
                            <div className={styles.apr}>
                                {poolApy === undefined ? '…' : `${poolApy}%`}
                            </div>
                        </div> */}
                        <div className={styles.row}>
                            <div className={styles.row_title}>24h Vol.</div>
                            <div className={styles.vol}>
                                {poolVolume24h === undefined
                                    ? '…'
                                    : `$${poolVolume24h}`}
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
