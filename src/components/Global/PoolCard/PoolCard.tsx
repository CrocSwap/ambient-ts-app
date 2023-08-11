import styles from './PoolCard.module.css';
import { Link } from 'react-router-dom';
import useFetchPoolStats from '../../../App/hooks/useFetchPoolStats';
import TokenIcon from '../TokenIcon/TokenIcon';
import uriToHttp from '../../../utils/functions/uriToHttp';
import { PoolIF } from '../../../utils/interfaces/exports';

interface propsIF {
    pool: PoolIF;
}

export default function PoolCard(props: propsIF) {
    const { pool } = props;

    const poolData = useFetchPoolStats(pool);

    const {
        poolVolume,
        poolPrice,
        poolTvl,
        poolApy,
        poolPriceChangePercent,
        isPoolPriceChangePositive,
        poolLink,
        shouldInvertDisplay,
    } = poolData;

    const poolPriceDisplayDOM = (
        <div className={styles.price}>
            {poolPrice === undefined ? '…' : poolPrice}
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
                {poolPrice === undefined || poolPriceChangePercent === undefined
                    ? '…'
                    : poolPriceChangePercent}
            </div>
        </div>
    );

    const ariaDescription = `pool for ${pool.base.symbol} and ${
        pool.quote.symbol
    }. 24 hour volume is ${poolVolume ? poolVolume : 'not available'}. APY is ${
        poolApy ? poolApy + '%' : 'not available'
    }. TVL is ${poolTvl}. 24 hours pool price change is ${poolPriceChangePercent}. Pool price is ${
        poolPrice ? poolPrice : 'not available'
    }. `;

    return (
        <Link
            className={styles.pool_card}
            to={poolLink}
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
                        {/* <div className={styles.row}>
                            <div className={styles.row_title}>24h APR</div>
                            <div className={styles.apr}>
                                {poolApy === undefined ? '…' : `${poolApy}%`}
                            </div>
                        </div> */}
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
