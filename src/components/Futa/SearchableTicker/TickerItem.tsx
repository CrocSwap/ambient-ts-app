import { Link } from 'react-router-dom';
import styles from './SearchableTicker.module.css';
type TickerItem = {
    ticker: string;
    marketCap: string;
    timeRem: string;
    status: string | null;
};
interface PropsIF {
    tickerItem: TickerItem;
}
export default function TickerItem({ tickerItem }: PropsIF) {
    const { ticker, marketCap, timeRem, status } = tickerItem;

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
