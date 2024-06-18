import { Link } from 'react-router-dom';
import styles from './SearchableTicker.module.css';
import {
    getFormattedNumber,
    getTimeRemaining,
} from '../../../ambient-utils/dataLayer';
import moment from 'moment';
import { useContext } from 'react';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { AuctionDataIF } from '../../../contexts/AuctionsContext';

export default function TickerItem(props: AuctionDataIF) {
    const { ticker, marketCap, createdAt, status } = props;

    const { nativeTokenUsdPrice } = useContext(ChainDataContext);

    const timeRemaining = getTimeRemaining(
        moment(createdAt * 1000).diff(Date.now() - 604800000, 'seconds'),
    );

    const status2 =
        timeRemaining === 'COMPLETE' ? 'var(--accent1)' : 'var(--accent4)';

    const marketCapUsdValue =
        nativeTokenUsdPrice !== undefined && marketCap !== undefined
            ? nativeTokenUsdPrice * marketCap
            : undefined;

    const formattedMarketCap =
        marketCapUsdValue !== undefined
            ? marketCapUsdValue
                ? getFormattedNumber({
                      value: marketCapUsdValue,
                      isUSD: true,
                  })
                : '$0.00'
            : undefined;

    return (
        <Link
            className={styles.tickerItemContainer}
            to={'/auctions/v1/' + ticker}
        >
            <p>{ticker}</p>
            <p>{formattedMarketCap}</p>
            <p style={{ color: status ? status : 'var(--text1)' }}>
                {timeRemaining}
            </p>
            <div className={styles.statusContainer}>
                {status2 && (
                    <span
                        className={styles.tickerStatus}
                        style={{ background: status2 ? status2 : '' }}
                    />
                )}
            </div>
        </Link>
    );
}
