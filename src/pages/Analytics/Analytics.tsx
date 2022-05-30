import styles from './Analytics.module.css';
import AnalyticsTabs from '../../components/Analytics/AnalyticsTabs/AnalyticsTabs';

export default function Analytics() {
    return (
        <main data-testid={'analytics'} className={styles.analytics_container}>
            <AnalyticsTabs />
        </main>
    );
}
