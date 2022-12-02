import styles from './Analytics2.module.css';
import { Outlet, useLocation } from 'react-router-dom';
import { Dispatch, SetStateAction } from 'react';

import GraphContainer from '../../components/Analytics/GraphContainer/GraphContainer';

import AnalyticsHeader from '../../components/Analytics/AnalyticsHeader/AnalyticsHeader';

interface Analytics2Props {
    analyticsSearchInput: string;
    setAnalyticsSearchInput: Dispatch<SetStateAction<string>>;
}
export default function Analytics2(props: Analytics2Props) {
    const { analyticsSearchInput, setAnalyticsSearchInput } = props;
    const location = useLocation();
    const currentLocation = location.pathname;

    const graphContainerOrNull = analyticsSearchInput == '' ? <GraphContainer /> : null;

    return (
        <>
            <section data-testid={'analytics'} className={styles.analytics_container}>
                <AnalyticsHeader />
                {currentLocation === '/analytics2/overview' && graphContainerOrNull}
                <Outlet context={[analyticsSearchInput, setAnalyticsSearchInput]} />

                {/* <TopTokens />
            <TopPools />
            <TopRanges />
            <TrendingPools />
        <AnalyticsTransactions /> */}
            </section>
        </>
    );
}
