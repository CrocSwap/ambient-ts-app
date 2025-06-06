import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    getFormattedNumber,
    isDefaultDenomTokenExcludedFromUsdConversion,
    isPairBtcTokens,
    isPairEthTokens,
    isUsdStableToken,
    isWbtcOrStakedBTCToken,
    uriToHttp,
} from '../../../ambient-utils/dataLayer';
import { PoolIF } from '../../../ambient-utils/types';
import { AppStateContext } from '../../../contexts';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { linkGenMethodsIF, useLinkGen } from '../../../utils/hooks/useLinkGen';
import TokenIcon from '../TokenIcon/TokenIcon';
import styles from './PoolCard.module.css';

interface propsIF {
    pool: PoolIF;
}

export default function PoolCard(props: propsIF) {
    const { pool } = props;

    const navigate = useNavigate();

    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);

    const { tokenA, tokenB } = useContext(TradeDataContext);

    const [isHovered, setIsHovered] = useState(false);

    const shouldInvertDisplay = !pool.isBaseTokenMoneynessGreaterOrEqual;

    const denomTokenIsUsdStableToken = shouldInvertDisplay
        ? isUsdStableToken(pool.quote)
        : isUsdStableToken(pool.base);

    const denomTokenIsWBTCToken = shouldInvertDisplay
        ? isWbtcOrStakedBTCToken(pool.quote)
        : isWbtcOrStakedBTCToken(pool.base);

    const excludeFromUsdConversion =
        isDefaultDenomTokenExcludedFromUsdConversion(
            pool.baseToken,
            pool.quoteToken,
        );

    const isEthStakedEthPair = isPairEthTokens(pool.base, pool.quote, chainId);
    const isPoolBtcPair = isPairBtcTokens(pool.base, pool.quote);

    const usdPrice = !pool.isBaseTokenMoneynessGreaterOrEqual
        ? (pool.quoteUsdPrice || 0) * (pool.displayPrice || 0)
        : (pool.baseUsdPrice || 0) * (pool.displayPrice || 0);

    const poolPriceDisplayDOM = (
        <div className={styles.price}>
            {pool.displayPrice === undefined
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
                      : pool.displayPriceString
                  : denomTokenIsWBTCToken ||
                      isEthStakedEthPair ||
                      isPoolBtcPair ||
                      excludeFromUsdConversion
                    ? pool.displayPriceString
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
        tokenA.address.toLowerCase() === pool.base.toLowerCase()
            ? [pool.base, pool.quote]
            : tokenA.address.toLowerCase() === pool.quote.toLowerCase()
              ? [pool.quote, pool.base]
              : tokenB.address.toLowerCase() === pool.base.toLowerCase()
                ? [pool.quote, pool.base]
                : [pool.base, pool.quote];

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
                    pool.isPoolPriceChangePositive ||
                    pool.isPoolPriceChangePositive === undefined
                        ? styles.change_positive
                        : styles.change_negative
                }
                style={{
                    color:
                        pool.isPoolPriceChangePositive === undefined
                            ? 'var(--text1)'
                            : undefined,
                }}
            >
                {pool.displayPrice === undefined ||
                !pool.priceChangePercentString
                    ? '…'
                    : pool.priceChangePercentString}
            </div>
        </div>
    );

    const formattedVolumeChange24h = pool.volumeChange24h
        ? getFormattedNumber({
              value: pool.volumeChange24h,
              prefix: '$',
          })
        : undefined;

    const formattedTVLTotalUSD = pool.tvlTotalUsd
        ? getFormattedNumber({
              value: pool.tvlTotalUsd,
              prefix: '$',
          })
        : undefined;

    const ariaDescription = `pool for ${pool.baseToken.symbol} and ${
        pool.quoteToken.symbol
    }. 24 hour volume is ${
        formattedVolumeChange24h ? formattedVolumeChange24h : 'not available'
    }.  TVL is ${formattedTVLTotalUSD}. 24 hours pool price change is ${pool.priceChange24h}. Pool price is ${
        pool.displayPrice ? pool.displayPrice : 'not available'
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
                                    ? pool.baseToken
                                    : shouldInvertDisplay
                                      ? pool.baseToken
                                      : pool.quoteToken
                            }
                            size='2xl'
                            src={uriToHttp(
                                shouldInvertDisplay === undefined
                                    ? pool.baseToken.logoURI
                                    : shouldInvertDisplay
                                      ? pool.baseToken.logoURI
                                      : pool.quoteToken.logoURI,
                            )}
                            alt={
                                shouldInvertDisplay === undefined
                                    ? pool.baseToken.symbol
                                    : shouldInvertDisplay
                                      ? pool.baseToken.symbol
                                      : pool.quoteToken.symbol
                            }
                        />
                        <TokenIcon
                            token={
                                shouldInvertDisplay === undefined
                                    ? pool.quoteToken
                                    : shouldInvertDisplay
                                      ? pool.quoteToken
                                      : pool.baseToken
                            }
                            size='2xl'
                            src={uriToHttp(
                                shouldInvertDisplay === undefined
                                    ? pool.quoteToken.logoURI
                                    : shouldInvertDisplay
                                      ? pool.quoteToken.logoURI
                                      : pool.baseToken.logoURI,
                            )}
                            alt={
                                shouldInvertDisplay === undefined
                                    ? pool.quoteToken.symbol
                                    : shouldInvertDisplay
                                      ? pool.quoteToken.symbol
                                      : pool.baseToken.symbol
                            }
                        />
                    </div>
                    <div className={styles.tokens_name}>
                        {shouldInvertDisplay === undefined
                            ? `${pool.baseToken.symbol} / ${pool.quoteToken.symbol}`
                            : shouldInvertDisplay
                              ? `${pool.baseToken.symbol} / ${pool.quoteToken.symbol}`
                              : `${pool.quoteToken.symbol} / ${pool.baseToken.symbol}`}
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
                                {formattedVolumeChange24h === undefined
                                    ? '…'
                                    : `${formattedVolumeChange24h}`}
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.row_title}>TVL</div>
                            <div className={styles.vol}>
                                {formattedTVLTotalUSD === undefined
                                    ? '…'
                                    : `${formattedTVLTotalUSD}`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
