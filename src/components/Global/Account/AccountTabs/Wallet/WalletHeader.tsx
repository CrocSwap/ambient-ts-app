import styles from './WalletHeader.module.css';

export default function WalletHeader() {
    return (
        <div className={styles.wallet_row}>
            <p className={styles.token}>Token</p>
            <p className={styles.value}>Value (USD)</p>
            <p className={styles.amount}>Amount</p>
        </div>
    );
}
