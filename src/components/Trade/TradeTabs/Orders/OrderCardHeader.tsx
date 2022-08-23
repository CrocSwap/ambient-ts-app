import styles from './OrderCardHeader.module.css';

// TRADE
export default function OrderCardHeader() {
    return (
        <div className={styles.main_container}>
            <div className={styles.row_container}>
                <p>ID</p>
                <p className={styles.wallet}>Wallet</p>
                <p className={styles.price}>Price</p>
                <p className={styles.side}>Side</p>
                <p className={styles.type}>Type</p>
                <p className={styles.tokens}>ETH/USDC</p>
                <p className={styles.token}>ETH</p>
                <p className={styles.token}>USDC</p>
            </div>

            <div></div>
        </div>
    );
}
