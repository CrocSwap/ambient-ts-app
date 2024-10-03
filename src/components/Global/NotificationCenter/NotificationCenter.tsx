import { AnimateSharedLayout } from 'framer-motion';
import { useEffect, useRef, useState, useMemo, useContext } from 'react';
import NotificationTable from './NotificationTable/NotificationTable';
import ActivityIndicator from './ActivityIndicator/ActivityIndicator';
import { getReceiptTxHashes } from '../../../ambient-utils/dataLayer';
import { ReceiptContext } from '../../../contexts/ReceiptContext';

const NotificationCenter = () => {
    const [showNotificationTable, setShowNotificationTable] =
        useState<boolean>(false);

    const { pendingTransactions, sessionReceipts } = useContext(ReceiptContext);

    const txCount = pendingTransactions.length + sessionReceipts.length;

    useEffect(() => {
        if (txCount === 0) {
            setShowNotificationTable(false);
        }
    }, [txCount]);

    const receivedReceiptHashes = useMemo(
        () => getReceiptTxHashes(sessionReceipts),
        [JSON.stringify(sessionReceipts)],
    );

    const currentPendingTransactionsArray = pendingTransactions.filter(
        (hash: string) => !receivedReceiptHashes.includes(hash),
    );

    const notificationItemRef = useRef<HTMLDivElement>(null);
    const activityCenterRef = useRef<HTMLDivElement>(null);

    return (
        <AnimateSharedLayout>
            <div>
                <span ref={activityCenterRef}>
                    <ActivityIndicator
                        value={receivedReceiptHashes.length}
                        pending={currentPendingTransactionsArray.length > 0}
                        showNotificationTable={showNotificationTable}
                        setShowNotificationTable={setShowNotificationTable}
                    />
                </span>

                <div>
                    <NotificationTable
                        showNotificationTable={showNotificationTable}
                        setShowNotificationTable={setShowNotificationTable}
                        pendingTransactions={currentPendingTransactionsArray}
                        notificationItemRef={notificationItemRef}
                    />
                </div>
                <div></div>
            </div>
        </AnimateSharedLayout>
    );
};

export default NotificationCenter;
