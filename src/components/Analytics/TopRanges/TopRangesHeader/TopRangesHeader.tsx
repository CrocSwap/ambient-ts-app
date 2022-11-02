import styles from './TopRangesHeader.module.css';
export default function TopRangesHeader() {
    return (
        <div className={styles.container}>
            <p>#</p>
            <p>Pool</p>
            <p>ID</p>
            <p>Wallet</p>
            <p>Min</p>
            <p>Max</p>
            <p>ETH</p>
            <p>USDC</p>
            <p>APY</p>
            <p>Status</p>
        </div>
    );
}
