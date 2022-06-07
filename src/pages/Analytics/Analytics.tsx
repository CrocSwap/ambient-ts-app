import styles from './Analytics.module.css';
import AnalyticsTabs from '../../components/Analytics/AnalyticsTabs/AnalyticsTabs';
import GraphContainer from '../../components/Analytics/GraphContainer/GraphContainer';
import { SetStateAction } from 'react';

interface AnalyticsProps {
    showEditComponent: boolean;
    setShowEditComponent: React.Dispatch<SetStateAction<boolean>>;
}

export default function Analytics(props: AnalyticsProps) {
    const { showEditComponent, setShowEditComponent } = props;
    return (
        <main data-testid={'analytics'} className={styles.analytics_container}>
            <GraphContainer />
            <AnalyticsTabs
                showEditComponent={showEditComponent}
                setShowEditComponent={setShowEditComponent}
                notOnTradeRoute
            />
        </main>
    );
}
