import styles from './TopPoolsHeader.module.css';
export default function TopPoolsHeader() {
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
