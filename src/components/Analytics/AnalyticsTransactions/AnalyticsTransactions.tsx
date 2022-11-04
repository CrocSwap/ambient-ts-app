import styles from './AnalyticsTransactions.module.css';
import AnalyticsTransactionsCard from './AnalyticsTransactionsCard/AnalyticsTransactionsCard';
import AnalyticsTransactionsHeader from './AnalyticsTransactionsHeader/AnalyticsTransactionsHeader';
import { motion } from 'framer-motion';
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
        <motion.div
            className={styles.main_container}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <p> Transactions</p>

            <AnalyticsTransactionsHeader />
            {container}
        </motion.div>
    );
}
