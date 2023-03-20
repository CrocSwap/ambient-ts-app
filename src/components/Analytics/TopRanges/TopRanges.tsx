import styles from './TopRanges.module.css';
import TopRangesCard from './TopRangesCard/TopRangesCard';
import TopRangesHeader from './TopRangesHeader/TopRangesHeader';
import { motion } from 'framer-motion';
import AnalyticsTokenRows from '../AnalyticsTokenRows/AnalyticsTokenRows';
import { Dispatch, SetStateAction } from 'react';
interface TopRangesPropsIF {
    analyticsSearchInput: string;
    setAnalyticsSearchInput: Dispatch<SetStateAction<string>>;
}
const TopRanges = (props: TopRangesPropsIF) => {
    const { analyticsSearchInput } = props;

    const items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const container = (
        <div className={styles.item_container}>
            {items.map((item, idx) => (
                <TopRangesCard key={idx} number={item + 1} />
            ))}
        </div>
    );

    const exampleSearch = (
        <div className={styles.item_container}>
            {items.slice(0, 3).map((item, idx) => (
                <TopRangesCard key={idx} number={item + 1} searchInput={analyticsSearchInput} />
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
            {analyticsSearchInput == '' && <AnalyticsTokenRows />}
            <p>{analyticsSearchInput ? `Top Ranges with ${analyticsSearchInput}` : 'Top Ranges'}</p>
            <TopRangesHeader />

            {analyticsSearchInput !== '' ? exampleSearch : container}
        </motion.div>
    );
};

export default TopRanges;
