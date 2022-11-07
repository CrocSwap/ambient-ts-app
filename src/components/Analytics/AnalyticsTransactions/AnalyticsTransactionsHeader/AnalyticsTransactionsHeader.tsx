import styles from './AnalyticsTransactionsHeader.module.css';
import { Dispatch, SetStateAction } from 'react';

type txData = {
    label: string;
    data: string;
};
interface AnalyticsTransactionsHeaderPropsIF {
    setCurrentTransactions: Dispatch<SetStateAction<txData>>;
    currentTransactions: txData;
    tabControlData: txData[];
}
export default function AnalyticsTransactionsHeader(props: AnalyticsTransactionsHeaderPropsIF) {
    const { currentTransactions, setCurrentTransactions, tabControlData } = props;

    const tabsControl = (
        <div className={styles.tabs_container}>
            {tabControlData.map((tx) => (
                <button
                    onClick={() => setCurrentTransactions(tx)}
                    key={tx.label}
                    className={
                        currentTransactions.label === tx.label
                            ? styles.active_tx_control_button
                            : styles.tx_control_button
                    }
                >
                    {tx.label}
                </button>
            ))}
        </div>
    );
    return (
        <div className={styles.container}>
            {tabsControl}
            <p>Total Value</p>
            <p>Token Amount</p>
            <p>Token Amount</p>
            <p>Account</p>
            <p>Time</p>
        </div>
    );
}
