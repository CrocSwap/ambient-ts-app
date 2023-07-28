import styles from './NotificationTable.module.css';
import { Dispatch, RefObject, SetStateAction } from 'react';
import ReceiptDisplay from '../ReceiptDisplay/ReceiptDisplay';

import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import { resetReceiptData } from '../../../../utils/state/receiptDataSlice';

interface NotificationTableProps {
    showNotificationTable: boolean;
    setShowNotificationTable: Dispatch<SetStateAction<boolean>>;
    pendingTransactions: string[];
    notificationItemRef: RefObject<HTMLDivElement>;
}

const NotificationTable = (props: NotificationTableProps) => {
    const { showNotificationTable, pendingTransactions, notificationItemRef } =
        props;

    const dispatch = useAppDispatch();

    const receiptData = useAppSelector((state) => state.receiptData);

    const transactionsByType = receiptData.transactionsByType;

    const parsedReceipts = receiptData.sessionReceipts.map((receipt) =>
        JSON.parse(receipt),
    );

    const successfulTransactions = parsedReceipts.filter(
        (receipt) => receipt?.status === 1,
    );

    const failedTransactions = parsedReceipts.filter(
        (receipt) => receipt?.status === 0,
    );

    const successfulTransactionsDisplay = successfulTransactions.map(
        (tx, idx) => (
            <ReceiptDisplay
                key={idx}
                status='successful'
                hash={tx?.transactionHash}
                txBlockNumber={tx.blockNumber}
                txType={
                    transactionsByType.find(
                        (e) => e.txHash === tx?.transactionHash,
                    )?.txTypeDetails
                }
            />
        ),
    );
    const failedTransactionsDisplay = failedTransactions.map((tx, idx) => (
        <ReceiptDisplay
            key={idx}
            status='failed'
            hash={tx?.transactionHash}
            txBlockNumber={tx.blockNumber}
            txType={
                transactionsByType.find((e) => e.txHash === tx?.transactionHash)
                    ?.txTypeDetails
            }
        />
    ));
    const pendingTransactionsDisplay = pendingTransactions.map((tx, idx) => (
        <ReceiptDisplay
            key={idx}
            status='pending'
            hash={tx}
            txType={
                transactionsByType.find((e) => e.txHash === tx)?.txTypeDetails
            }
        />
    ));

    if (!showNotificationTable) return null;
    return (
        <div className={styles.main_container}>
            <div ref={notificationItemRef} className={styles.container}>
                <section className={styles.header}>Recent Transactions</section>

                <section className={styles.content}>
                    {pendingTransactionsDisplay}
                    {failedTransactionsDisplay}
                    {successfulTransactionsDisplay}
                </section>

                <section className={styles.footer}>
                    <button
                        onClick={() => {
                            dispatch(resetReceiptData());
                        }}
                        aria-label='Clear all'
                    >
                        Clear all
                    </button>
                </section>
            </div>
        </div>
    );
};

export default NotificationTable;
