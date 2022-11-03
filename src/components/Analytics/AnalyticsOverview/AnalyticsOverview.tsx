import styles from './AnalyticsOverview.module.css';
import TopPools from '../TopPools/TopPools';
import TopRanges from '../TopRanges/TopRanges';
import TopTokens from '../TopTokens/TopTokens';
import AnalyticsTransactions from '../AnalyticsTransactions/AnalyticsTransactions';
import TrendingPools from '../TrendingPools/TrendingPools';
export default function AnalyticsOverview() {
    return (
        <div className={styles.container}>
            <TopTokens />
            <TopPools />
            <TrendingPools />
            <AnalyticsTransactions />
            <TopRanges />
        </div>
    );
}
