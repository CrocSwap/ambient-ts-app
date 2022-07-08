import styles from './TopTokens.module.css';
import TopTokensCard from './TopTokensCard';
export default function TopTokens() {
    const header = (
        <div className={styles.header}>
            <div>Pool</div>
            <div>Price</div>
            <div>Change</div>
        </div>
    );

    const mapItems = [1, 2, 3, 4, 5, 6];
    return (
        <div className={styles.container}>
            {header}

            {mapItems.map((item, idx) => (
                <TopTokensCard key={idx} />
            ))}
        </div>
    );
}
