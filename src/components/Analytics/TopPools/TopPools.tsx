import styles from './TopPools.module.css';
import TopPoolsCard from './TopPoolsCard/TopPoolsCard';
import TopPoolsHeader from './TopPoolsHeader/TopPoolsHeader';
import { uniswapPools } from '../fakedata/uniswapTokens';
import { motion } from 'framer-motion';
import AnalyticsTokenRows from '../AnalyticsTokenRows/AnalyticsTokenRows';
import AnalyticsPoolRows from '../AnalyticsPoolRows/AnalyticsPoolRows';
import { Dispatch, SetStateAction } from 'react';
interface TrendingPoolsPropsIF {
    analyticsSearchInput: string;
    setAnalyticsSearchInput: Dispatch<SetStateAction<string>>;
}
export default function TopPools(props: TrendingPoolsPropsIF) {
    const { analyticsSearchInput } = props;
    const container = (
        <div className={styles.item_container}>
            {uniswapPools.slice(0, 10).map((pair, idx) => (
                <TopPoolsCard pair={pair} key={idx} number={idx + 1} />
            ))}
        </div>
    );
    const exampleSearch = (
        <div className={styles.item_container}>
            {uniswapPools.slice(0, 2).map((pair, idx) => (
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
            <p>
                {analyticsSearchInput
                    ? `Trending Pools with ${analyticsSearchInput}`
                    : 'Trending Pools'}
            </p>

            {<AnalyticsPoolRows searchInput={analyticsSearchInput} />}

            <p>{analyticsSearchInput ? `All Pools with ${analyticsSearchInput}` : 'All Pools'}</p>

            {analyticsSearchInput == '' && <AnalyticsTokenRows />}

            {analyticsSearchInput == '' && <TopPoolsHeader />}

            {analyticsSearchInput == '' ? container : exampleSearch}
        </motion.div>
    );
}
