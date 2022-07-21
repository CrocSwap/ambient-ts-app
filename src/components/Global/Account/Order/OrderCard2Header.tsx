import styles from './OrderCard2Header.module.css';

export default function OrderCard2Header() {
    return (
        <div className={styles.main_container}>
            <div className={styles.row_container}>
                <p>ID</p>
                <p className={styles.wallet}>Wallet</p>
                <p>Price</p>
                <p className={styles.side}>Side</p>
                <p>Type</p>
                <p className={styles.tokens}>ETH/USDC</p>
                <p className={styles.token}>ETH</p>
                <p className={styles.token}>USDC</p>
                <p>ST</p>
            </div>

            <div />
        </div>
    );
}
