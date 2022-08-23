import styles from './Analytics.module.css';
import AnalyticsTabs from '../../components/Analytics/AnalyticsTabs/AnalyticsTabs';
import GraphContainer from '../../components/Analytics/GraphContainer/GraphContainer';
import { SetStateAction, Dispatch } from 'react';

interface AnalyticsProps {
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
}

export default function Analytics(props: AnalyticsProps) {
    return (
        <main data-testid={'analytics'} className={styles.analytics_container}>
            <GraphContainer />
            <AnalyticsTabs
                setOutsideControl={props.setOutsideControl}
                setSelectedOutsideTab={props.setSelectedOutsideTab}
            />
        </main>
    );
}
