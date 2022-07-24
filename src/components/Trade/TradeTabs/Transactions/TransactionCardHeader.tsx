import styles from './TransactionCardHeader.module.css';

export default function TransactionCardHeader() {
    return (
        <div className={styles.header_container}>
            <div className={styles.header_container_items}>
                <p className={styles.account}>ID</p>
                <p className={styles.account}>Wallet</p>
                <p className={styles.price}>Price</p>
                <p>Type</p>
                <p>Side</p>
                <p>ETH</p>
                <p>USDC</p>
            </div>
            <div className={styles.menu}></div>
        </div>
    );
}
