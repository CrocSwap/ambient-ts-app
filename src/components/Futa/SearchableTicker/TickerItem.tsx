import { Link } from 'react-router-dom';
import styles from './SearchableTicker.module.css';
import { auctionDataIF } from '../../../pages/platformFuta/mockAuctionData';
import { getTimeRemaining } from '../../../ambient-utils/dataLayer';
import moment from 'moment';

export default function TickerItem(props: auctionDataIF) {
    const { ticker, marketCap, createdAt, status } = props;

    const timeRemaining = getTimeRemaining(
        moment(createdAt * 1000).diff(Date.now() - 604800000, 'seconds'),
    );

    return (
        <Link
            className={styles.tickerItemContainer}
            to={'/auctions/v1/' + ticker}
        >
            <p>{ticker}</p>
            <p>${marketCap}</p>
            <p style={{ color: status ? status : 'var(--text1)' }}>
                {timeRemaining}
            </p>
            <div className={styles.statusContainer}>
                {status && (
                    <span
                        className={styles.tickerStatus}
                        style={{ background: status ? status : '' }}
                    />
                )}
            </div>
        </Link>
    );
}
