import styles from './WalletHeader.module.css';

export default function WalletCard() {
    return (
        <div className={styles.wallet_row}>
            <p>Token</p>
            <p className={styles.value}>Value</p>
            <p className={styles.amount}>Amount</p>
        </div>
    );
}
