import styles from './Analytics.module.css';
import Deposit from '../../components/Portfolio/EchangeBalance/Deposit/Deposit';
import AnalyticsTabs from '../../components/Analytics/AnalyticsTabs/AnalyticsTabs';

export default function Analytics() {
    return (
        <main data-testid={'analytics'} className={styles.analytics_container}>
            <AnalyticsTabs />
        </main>
    );
}
