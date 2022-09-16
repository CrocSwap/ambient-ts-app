import styles from './NotificationTable.module.css';
import { Dispatch, SetStateAction } from 'react';
import ReceiptDisplay from '../ReceiptDisplay/ReceiptDisplay';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';

interface NotificationTableProps {
    showNotificationTable: boolean;
    setShowNotificationTable: Dispatch<SetStateAction<boolean>>;
    pendingTransactions: string[];
    lastBlockNumber: number;
}
const NotificationTable = (props: NotificationTableProps) => {
    const { showNotificationTable, pendingTransactions, lastBlockNumber } = props;

    const receiptData = useAppSelector((state) => state.receiptData);

    const parsedReceipts = receiptData.sessionReceipts.map((receipt) => JSON.parse(receipt));

    const successfulTransactions = parsedReceipts.filter((receipt) => receipt?.confirmations >= 1);

    const failedTransactions = parsedReceipts.filter((receipt) => receipt?.confirmations <= 0);

    const successfulTransactionsDisplay = successfulTransactions
        ?.reverse()
        .map((tx, idx) => (
            <ReceiptDisplay
                key={idx}
                status='successful'
                hash={tx?.transactionHash}
                txBlockNumber={tx.blockNumber}
                lastBlockNumber={lastBlockNumber}
            />
        ));
    const failedTransactionsDisplay = failedTransactions
        ?.reverse()
        .map((tx, idx) => (
            <ReceiptDisplay
                key={idx}
                status='failed'
                hash={tx?.transactionHash}
                txBlockNumber={tx.blockNumber}
                lastBlockNumber={lastBlockNumber}
            />
        ));
    const pendingTransactionsDisplay = pendingTransactions
        ?.reverse()
        .map((tx, idx) => (
            <ReceiptDisplay
                key={idx}
                status='pending'
                hash={tx}
                lastBlockNumber={lastBlockNumber}
            />
        ));

    if (!showNotificationTable) return null;
    return (
        <div className={styles.main_container}>
            <div className={styles.container}>
                <section className={styles.header}>Recent Transactions</section>

                <section className={styles.content}>
                    {pendingTransactionsDisplay}
                    {failedTransactionsDisplay}
                    {successfulTransactionsDisplay}
                </section>

                <section className={styles.footer}>
                    <button>Clear all</button>
                </section>
            </div>
        </div>
    );
};

export default NotificationTable;
