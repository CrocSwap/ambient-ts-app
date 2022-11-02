import styles from './AnalyticsTransactions.module.css';
import AnalyticsTransactionsCard from './AnalyticsTransactionsCard/AnalyticsTransactionsCard';
import AnalyticsTransactionsHeader from './AnalyticsTransactionsHeader/AnalyticsTransactionsHeader';

export default function AnalyticsTransactions() {
    const items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const container = (
        <div className={styles.item_container}>
            {items.map((item, idx) => (
                <AnalyticsTransactionsCard key={idx} number={item + 1} />
            ))}
        </div>
    );
    return (
        <div className={styles.main_container}>
            <p> Transactions</p>

            <AnalyticsTransactionsHeader />
            {container}
        </div>
    );
}
