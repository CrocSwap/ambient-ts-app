import styles from './TopRangeCardHeader.module.css';

export default function TopRangeCardHeader() {
    return (
        <div className={styles.main_container}>
            <div className={styles.token_logos} />
            <div className={styles.row_container}>
                <p className={styles.token}>Pool</p>
                <p>ID</p>
                <p className={styles.wallet}>Wallet</p>
                <p className={styles.range}>Range</p>
                <p className={styles.range_sing}>Range Min</p>
                <p className={styles.range_sing}>Range Max</p>
                <p className={styles.tokens}>ETH/USDC</p>
                <p className={styles.token}>ETH</p>
                <p className={styles.token}>USDC</p>
                <p>APR</p>
                <p>Status</p>
            </div>

            <div></div>
        </div>
    );
}
