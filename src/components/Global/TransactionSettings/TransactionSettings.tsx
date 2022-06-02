import styles from './TransactionSettings.module.css';

import SlippageTolerance from '../SlippageTolerance/SlippageTolerance';

export default function TransactionSettings() {
    return (
        <div className={styles.settings_container}>
            <div className={styles.settings_title}></div>
            <SlippageTolerance />
        </div>
    );
}
