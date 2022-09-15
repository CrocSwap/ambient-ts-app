import styles from './NotificationCenter.module.css';
import { AnimateSharedLayout } from 'framer-motion';
import { Dispatch, SetStateAction } from 'react';
import NotificationTable from './NotificationTable/NotificationTable';
import ActivityIndicator from './ActivityIndicator/ActivityIndicator';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';

interface NotificationCenterPropsIF {
    showNotificationTable: boolean;
    setShowNotificationTable: Dispatch<SetStateAction<boolean>>;

    pendingTransactions: string[];
}

const NotificationCenter = (props: NotificationCenterPropsIF) => {
    const { showNotificationTable, setShowNotificationTable, pendingTransactions } = props;

    const receiptData = useAppSelector((state) => state.receiptData);

    const sessionReceipts = receiptData.sessionReceipts;

    const receiveReceiptHashes: Array<string> = [];
    // eslint-disable-next-line
    function handleParseReceipt(receipt: any) {
        const parseReceipt = JSON.parse(receipt);
        receiveReceiptHashes.push(parseReceipt?.transactionHash);
    }
    sessionReceipts.map((receipt) => handleParseReceipt(receipt));

    const currentPendingTransactionsArray = pendingTransactions.filter(
        (hash: string) => !receiveReceiptHashes.includes(hash),
    );

    return (
        <AnimateSharedLayout>
            <div className={styles.container}>
                <ActivityIndicator
                    value={receiveReceiptHashes.length}
                    pending={currentPendingTransactionsArray.length > 0}
                    showNotificationTable={showNotificationTable}
                    setShowNotificationTable={setShowNotificationTable}
                />

                <NotificationTable
                    showNotificationTable={showNotificationTable}
                    setShowNotificationTable={setShowNotificationTable}
                    pendingTransactions={currentPendingTransactionsArray}
                />
            </div>
        </AnimateSharedLayout>
    );
};

export default NotificationCenter;
