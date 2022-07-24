import styles from './TransactionCardHeader.module.css';

export default function TransactionCardHeader() {
    const headerRow = (
        <div className={styles.row}>
            <p className={styles.pool}>Pool</p>

            <p className={styles.account}>Account</p>
            <p className={styles.id}>ID</p>
            <p className={styles.wallet}>Wallet</p>

            <p className={styles.price}>Price</p>
            <p className={styles.side}>Side</p>
            <p className={styles.type}>Type</p>

            <p className={styles.amount}>Amount</p>
            <p className={styles.token1}>ETH</p>
            <p className={styles.token2}>USDC</p>
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
