import styles from './TokensHeader.module.css';

export default function TokensHeader() {
    return (
        <div className={styles.exchange_row}>
            <p className={styles.token}>Token</p>
            <p className={styles.network}>Network</p>
            <p className={styles.address}>Address</p>
        </div>
    );
}
