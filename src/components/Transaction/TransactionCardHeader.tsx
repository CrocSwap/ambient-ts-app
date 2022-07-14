import styles from './TransactionCardHeader.module.css';

export default function TransactionCardHeader() {
    return (
        <div className={styles.header_container}>
            <div className={styles.header_container_items}>
                <p>ID</p>
                <p>Wallet</p>
                <p>Price</p>
                <p>Type</p>
                <p>Side</p>
                <p>ETH</p>
                <p>USDC</p>
            </div>
            <div className={styles.menu}>Menu</div>
        </div>
    );
}
