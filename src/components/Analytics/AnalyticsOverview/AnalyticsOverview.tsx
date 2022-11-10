import styles from './AnalyticsOverview.module.css';
// import TopPools from '../TopPools/TopPools';
import TopRanges from '../TopRanges/TopRanges';
import TopTokens from '../TopTokens/TopTokens';
import AnalyticsTransactions from '../AnalyticsTransactions/AnalyticsTransactions';
import TrendingPools from '../TrendingPools/TrendingPools';
import { AnimatePresence, motion } from 'framer-motion';
// import { useOutletContext } from 'react-router-dom';
import { Dispatch, SetStateAction } from 'react';

interface AnalyticsOverviewPropsIF {
    analyticsSearchInput: string;
    setAnalyticsSearchInput: Dispatch<SetStateAction<string>>;
}
export default function AnalyticsOverview(props: AnalyticsOverviewPropsIF) {
    const { analyticsSearchInput, setAnalyticsSearchInput } = props;
    return (
        <AnimatePresence exitBeforeEnter>
            <motion.div className={styles.container}>
                <TopTokens
                    analyticsSearchInput={analyticsSearchInput}
                    setAnalyticsSearchInput={setAnalyticsSearchInput}
                />

                <TrendingPools
                    analyticsSearchInput={analyticsSearchInput}
                    setAnalyticsSearchInput={setAnalyticsSearchInput}
                />

                <TopRanges
                    analyticsSearchInput={analyticsSearchInput}
                    setAnalyticsSearchInput={setAnalyticsSearchInput}
                />

                <AnalyticsTransactions
                    analyticsSearchInput={analyticsSearchInput}
                    setAnalyticsSearchInput={setAnalyticsSearchInput}
                />

                {/* <TopPools /> */}
            </motion.div>
        </AnimatePresence>
    );
}
