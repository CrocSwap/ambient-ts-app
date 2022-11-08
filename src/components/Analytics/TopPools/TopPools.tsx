import styles from './TopPools.module.css';
import TopPoolsCard from './TopPoolsCard/TopPoolsCard';
import TopPoolsHeader from './TopPoolsHeader/TopPoolsHeader';
import { uniswapPools } from '../fakedata/uniswapTokens';
import { motion } from 'framer-motion';
import AnalyticsTokenRows from '../AnalyticsTokenRows/AnalyticsTokenRows';
export default function TopPools() {
    const container = (
        <div className={styles.item_container}>
            {uniswapPools.slice(0, 10).map((pair, idx) => (
                <TopPoolsCard pair={pair} key={idx} number={idx + 1} />
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
            {/* <p>Trending Pools</p> */}
            <p>All Pools</p>
            <AnalyticsTokenRows />
            <TopPoolsHeader />

            {container}
        </motion.div>
    );
}
