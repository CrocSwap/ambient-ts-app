import styles from './TopRanges.module.css';
import TopRangesCard from './TopRangesCard/TopRangesCard';
import TopRangesHeader from './TopRangesHeader/TopRangesHeader';
import { motion } from 'framer-motion';
const TopRanges = () => {
    const items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const container = (
        <div className={styles.item_container}>
            {items.map((item, idx) => (
                <TopRangesCard key={idx} number={item + 1} />
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
            <p>Top Ranges</p>
            <TopRangesHeader />

            {container}
        </motion.div>
    );
};

export default TopRanges;
