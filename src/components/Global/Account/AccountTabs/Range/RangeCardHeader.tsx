import styles from './RangeCardHeader.module.css';
export default function RangeCardHeader() {
    return (
        <div className={styles.main_container}>
            <div className={styles.token_logos}></div>
            <div className={styles.row_container}>
                <p className={styles.pool}>Pool</p>
                {/* <p>ID</p> */}
                {/* <p className={styles.wallet}>Wallet</p> */}
                {/* <p className={styles.range}>Range</p> */}
                <p className={styles.range_sing}>Range Min</p>
                <p className={styles.range_sing}>Range Max</p>
                <p className={styles.range_sing}>Value</p>
                <p className={styles.token}>Token A Qty</p>
                <p className={styles.token}>Token B Qty</p>
                <p>APR</p>
                <p>Status</p>
            </div>

            <div></div>
        </div>
    );
}
