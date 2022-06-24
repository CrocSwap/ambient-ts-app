import styles from './TransactionSettings.module.css';

import SlippageTolerance from '../SlippageTolerance/SlippageTolerance';

interface TransactionSettingsProps {
    onClose: () => void;
}

export default function TransactionSettings(props: TransactionSettingsProps) {
    return (
        <div className={styles.settings_container}>
            <div className={styles.settings_title}>Settings</div>
            <SlippageTolerance />
            <button onClick={props.onClose}>Submit</button>
        </div>
    );
}
