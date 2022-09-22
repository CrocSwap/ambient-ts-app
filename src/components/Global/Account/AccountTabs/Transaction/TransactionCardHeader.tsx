import styles from './TransactionCardHeader.module.css';

export default function TransactionCardHeader() {
    return (
        <div className={styles.main_container}>
            <div className={styles.token_logos} />

            <div className={styles.row_container}>
                <p className={styles.pool}>Pool</p>
                {/* <p>ID</p> */}
                {/* <p className={styles.wallet}>Wallet</p> */}
                <p className={styles.price}>Price</p>
                <p className={styles.side}>Side</p>
                <p className={styles.type}>Type</p>
                <p className={styles.token}>Value</p>
                {/* <p className={styles.tokens}>ETH/USDC</p> */}
                <p className={styles.token}>Token A Qty</p>
                <p className={styles.token}>Token B Qty</p>
            </div>

            <div></div>
        </div>
    );
}
