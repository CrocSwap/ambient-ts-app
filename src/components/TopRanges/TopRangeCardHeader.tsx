import styles from './TopRangeCardHeader.module.css';

export default function TopRangeCardHeader() {
    return (
        <div className={styles.main_container}>
            <div className={styles.token_logos} />
            <div className={styles.row_container}>
                <p className={styles.pool}>Pool</p>
                <p>ID</p>
                <p className={styles.wallet}>Wallet</p>
                <p className={styles.price}>Range</p>
                <p className={styles.token}>ETH</p>
                <p className={styles.token}>USDC</p>
                <p>APY</p>
                <p>Status</p>
                <p></p>
            </div>

            <div></div>
        </div>
    );
}
