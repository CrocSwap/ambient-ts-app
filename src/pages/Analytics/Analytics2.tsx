import styles from './Analytics2.module.css';
import { Outlet, useLocation } from 'react-router-dom';

import GraphContainer from '../../components/Analytics/GraphContainer/GraphContainer';

import AnalyticsHeader from '../../components/Analytics/AnalyticsHeader/AnalyticsHeader';

export default function Analytics2() {
    const location = useLocation();
    const currentLocation = location.pathname;

    return (
        <>
            <main data-testid={'analytics'} className={styles.analytics_container}>
                <AnalyticsHeader />
                {currentLocation === '/analytics2/overview' && <GraphContainer />}
                <Outlet />

                {/* <TopTokens />
            <TopPools />
            <TopRanges />
            <TrendingPools />
        <AnalyticsTransactions /> */}
            </main>
        </>
    );
}
