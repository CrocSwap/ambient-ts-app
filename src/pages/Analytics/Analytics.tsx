import Deposit from '../../components/Portfolio/EchangeBalance/Deposit/Deposit';
import styles from './Analytics.module.css';

export default function Analytics() {
    return (
        <main data-testid={'analytics'} className={styles.analytics_container}>
            {/* <h1>This is Analytics.tsx</h1> */}
            <Deposit fieldId='exchange-balance-deposit' />
        </main>
    );
}
