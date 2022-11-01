import styles from './AnalyticsTransactionsHeader.module.css';
export default function AnalyticsTransactionsHeader() {
    return (
        <div className={styles.container}>
            <div>actions</div>
            <p>Total Value</p>
            <p>Token Amount</p>
            <p>Token Amount</p>
            <p>Account</p>
            <p>Time</p>
        </div>
    );
}
