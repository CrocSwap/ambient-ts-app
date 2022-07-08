import styles from './TopPools.module.css';
import TopPoolsCard from './TopPoolsCard';
export default function TopPools() {
    const header = (
        <div className={styles.header}>
            <div>Pool</div>
            <div>Volume</div>
            <div>TVL</div>
        </div>
    );

    const mapItems = [1, 2, 3, 4, 5, 6, 7];
    return (
        <div className={styles.container}>
            {header}
            <div className={styles.content}>
                {mapItems.map((item, idx) => (
                    <TopPoolsCard key={idx} />
                ))}
            </div>
        </div>
    );
}
