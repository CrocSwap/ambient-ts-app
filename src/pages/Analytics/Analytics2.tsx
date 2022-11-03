import styles from './Analytics2.module.css';
import { Outlet } from 'react-router-dom';

import AnalyticsTabs from '../../components/Analytics/AnalyticsTabs/AnalyticsTabs';
import GraphContainer from '../../components/Analytics/GraphContainer/GraphContainer';
import { SetStateAction, Dispatch } from 'react';
import { PoolIF } from '../../utils/interfaces/PoolIF';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import TopTokens from '../../components/Analytics/TopTokens/TopTokens';
import TopPools from '../../components/Analytics/TopPools/TopPools';
import TrendingPools from '../../components/Analytics/TrendingPools/TrendingPools';
import TopRanges from '../../components/Analytics/TopRanges/TopRanges';
import AnalyticsTransactions from '../../components/Analytics/AnalyticsTransactions/AnalyticsTransactions';

export default function Analytics2() {
    return (
        <main data-testid={'analytics'} className={styles.analytics_container}>
            <GraphContainer />
            <Outlet />

            {/* <TopTokens />
            <TopPools />
            <TopRanges />
            <TrendingPools />
            <AnalyticsTransactions /> */}
        </main>
    );
}
