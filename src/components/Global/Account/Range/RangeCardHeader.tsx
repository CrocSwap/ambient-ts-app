import styles from './RangeCardHeader.module.css';
export default function RangeCardHeader() {
    const headerRow = (
        <div className={styles.row}>
            <p className={styles.pool}>Pool</p>

            <p className={styles.account}>Account</p>
            <p className={styles.id}>ID</p>
            <p className={styles.wallet}>Wallet</p>

            <p className={styles.range}>Range</p>

            <p className={styles.amount}>Amount</p>
            <p className={styles.token1}>ETH</p>
            <p className={styles.token2}>USDC</p>

            <p className={styles.apy}>APY</p>
            <p className={styles.status}>Status</p>
        </div>
    );
    return (
        <div className={styles.header_container}>
            <div />
            {headerRow}
            <div className={styles.menu} />
        </div>
    );
}
