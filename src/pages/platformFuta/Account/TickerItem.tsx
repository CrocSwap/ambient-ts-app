import styles from './Account.module.css';
type TickerItem = {
    ticker: string;
    marketCap: string;
    remaining: string;
    status: string | null;
};
interface PropsIF {
    tickerItem: TickerItem;
}
export default function TickerItem({ tickerItem }: PropsIF) {
    const { ticker, marketCap, remaining, status } = tickerItem;

    return (
        <div className={styles.tickerItemContainer}>
            <p className={styles.tickName}>{ticker}</p>
            <p>{marketCap}</p>
            <p style={{ color: status ? status : 'var(--text1)' }}>
                {remaining}
            </p>
            <div className={styles.statusContainer}>
                {status && (
                    <span
                        className={styles.tickerStatus}
                        style={{ background: status ? status : '' }}
                    />
                )}
            </div>
        </div>
    );
}
