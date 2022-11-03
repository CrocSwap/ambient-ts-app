import styles from './AnalyticsOverview.module.css';
import TopPools from '../TopPools/TopPools';
import TopRanges from '../TopRanges/TopRanges';
import TopTokens from '../TopTokens/TopTokens';
import AnalyticsTransactions from '../AnalyticsTransactions/AnalyticsTransactions';
import TrendingPools from '../TrendingPools/TrendingPools';
import AnimatedPage from '../../Global/AnimatedPage/AnimatedPage';
export default function AnalyticsOverview() {
    return (
        <div className={styles.container}>
            <AnimatedPage>
                <TopTokens />
            </AnimatedPage>
            <AnimatedPage>
                <TrendingPools />
            </AnimatedPage>
            <AnimatedPage>
                <TopRanges />
            </AnimatedPage>
            <AnimatedPage>
                <AnalyticsTransactions />
            </AnimatedPage>
            {/* <TopPools /> */}
        </div>
    );
}
