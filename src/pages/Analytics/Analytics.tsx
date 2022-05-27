import styles from './Analytics.module.css';
import Deposit from '../../components/Portfolio/EchangeBalance/Deposit/Deposit';

export default function Analytics() {
    return (
        <main data-testid={'analytics'} className={styles.analytics_container}>
            {/* <h1>This is Analytics.tsx</h1> */}
            <Deposit />
        </main>
    );
}
