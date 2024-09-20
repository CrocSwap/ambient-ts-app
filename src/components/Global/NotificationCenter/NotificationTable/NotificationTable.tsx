import { Dispatch, RefObject, SetStateAction, useContext } from 'react';
import ReceiptDisplay from '../ReceiptDisplay/ReceiptDisplay';

import styles from './NotificationTable.module.css';
import { FlexContainer } from '../../../../styled/Common';
import { ReceiptContext } from '../../../../contexts/ReceiptContext';
import { BrandContext } from '../../../../contexts/BrandContext';

interface NotificationTableProps {
    showNotificationTable: boolean;
    setShowNotificationTable: Dispatch<SetStateAction<boolean>>;
    pendingTransactions: string[];
    notificationItemRef: RefObject<HTMLDivElement>;
}

const NotificationTable = (props: NotificationTableProps) => {
    const { showNotificationTable, pendingTransactions, notificationItemRef } =
        props;

    const { platformName } = useContext(BrandContext);

    const { resetReceiptData, transactionsByType, sessionReceipts } =
        useContext(ReceiptContext);

    const parsedReceipts = sessionReceipts.map((receipt) =>
        JSON.parse(receipt),
    );

    const parsedReceiptsDisplay = parsedReceipts.map((receipt, idx) => (
        <ReceiptDisplay
            key={idx}
            status={receipt?.status === 1 ? 'successful' : 'failed'}
            hash={receipt?.hash}
            txBlockNumber={receipt?.blockNumber}
            txType={
                transactionsByType.find((e) => e.txHash === receipt?.hash)
                    ?.txDescription
            }
        />
    ));

    const pendingTransactionsDisplay = pendingTransactions.map((tx, idx) => (
        <ReceiptDisplay
            key={idx}
            status='pending'
            hash={tx}
            txType={
                transactionsByType.find((e) => e.txHash === tx)?.txDescription
            }
        />
    ));

    const isFuta = ['futa'].includes(platformName);

    if (!showNotificationTable) return null;
    return (
        <div className={styles.mainContainer}>
            <div
                className={`${styles.container} ${isFuta ? styles.container_futa : ''}`}
                ref={notificationItemRef}
            >
                {<h3 className={styles.header}>Recent Transactions</h3>}

                <div className={styles.content}>
                    {pendingTransactionsDisplay}
                    {parsedReceiptsDisplay}
                </div>

                <FlexContainer justifyContent='center' margin='auto'>
                    <button
                        className={styles.footerButton}
                        style={{
                            color: isFuta ? 'var(--dark1)' : 'var(--accent5)',
                        }}
                        onClick={() => {
                            resetReceiptData();
                        }}
                        aria-label='Clear all'
                    >
                        Clear all
                    </button>
                </FlexContainer>
            </div>
        </div>
    );
};

export default NotificationTable;
