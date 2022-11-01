import styles from './TrendingPoolsHeader.module.css';
export default function TrendingPoolsHeader() {
    return (
        <div className={styles.container}>
            <p>#</p>
            <p>Pool</p>
            <p>TVL</p>
            <p>Volume (24h)</p>
            <p>Volume (7D)</p>
            <p>TVL Change</p>
            <p>APY</p>
        </div>
    );
}
