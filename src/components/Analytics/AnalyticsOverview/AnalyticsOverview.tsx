import styles from './AnalyticsOverview.module.css';
// import TopPools from '../TopPools/TopPools';
import TopRanges from '../TopRanges/TopRanges';
import TopTokens from '../TopTokens/TopTokens';
import AnalyticsTransactions from '../AnalyticsTransactions/AnalyticsTransactions';
import TrendingPools from '../TrendingPools/TrendingPools';
import { AnimatePresence, motion } from 'framer-motion';

export default function AnalyticsOverview() {
    return (
        <AnimatePresence exitBeforeEnter>
            <motion.div className={styles.container}>
                <TopTokens />

                <TrendingPools />

                <TopRanges />

                <AnalyticsTransactions />

                {/* <TopPools /> */}
            </motion.div>
        </AnimatePresence>
    );
}
