import { Link } from 'react-router-dom';
import styles from './SearchableTicker.module.css';
import { auctionDataIF } from '../../../pages/platformFuta/mockAuctionData';

export default function TickerItem(props: auctionDataIF) {
    const { ticker, marketCap, timeRem, status } = props;

    return (
        <Link
            className={styles.tickerItemContainer}
            to={'/auctions/v1/' + ticker}
        >
            <p>{ticker}</p>
            <p>${marketCap}</p>
            <p style={{ color: status ? status : 'var(--text1)' }}>{timeRem}</p>
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
