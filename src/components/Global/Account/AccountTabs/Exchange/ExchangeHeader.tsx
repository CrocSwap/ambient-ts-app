import styles from './ExchangeHeader.module.css';

export default function ExchangeHeader() {
    return (
        <div className={styles.exchange_row}>
            <p className={styles.token}>Token</p>
            <p className={styles.value}>Value (USD)</p>
            <p className={styles.amount}>Amount</p>
        </div>
    );
}
