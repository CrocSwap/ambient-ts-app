import styles from './TokensHeader.module.css';

export default function TokensHeader() {
    return (
        <div className={styles.exchange_row}>
            <p className={styles.token}>Token</p>
            <p className={styles.value}>Symbol</p>
            <p className={styles.value}>Network</p>
            <p className={styles.token}>Address</p>
        </div>
    );
}