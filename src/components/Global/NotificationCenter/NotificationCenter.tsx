import styles from './NotificationCenter.module.css';
import { AnimateSharedLayout } from 'framer-motion';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import NotificationTable from './NotificationTable/NotificationTable';
import ActivityIndicator from './ActivityIndicator/ActivityIndicator';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import UseOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import { getReceiptTxHashes } from '../../../App/functions/getReceiptTxHashes';

interface NotificationCenterPropsIF {
    showNotificationTable: boolean;
    setShowNotificationTable: Dispatch<SetStateAction<boolean>>;
}

const NotificationCenter = (props: NotificationCenterPropsIF) => {
    const { showNotificationTable, setShowNotificationTable } = props;

    const receiptData = useAppSelector((state) => state.receiptData);

    const pendingTransactions = receiptData.pendingTransactions;

    const sessionReceipts = receiptData.sessionReceipts;

    const txCount = pendingTransactions.length + sessionReceipts.length;

    let receiveReceiptHashes: Array<string> = [];

    useEffect(() => {
        if (txCount === 0) setShowNotificationTable(false);
    }, [txCount]);

    useEffect(() => {
        receiveReceiptHashes = getReceiptTxHashes(sessionReceipts);
    }, [sessionReceipts]);

    const currentPendingTransactionsArray = pendingTransactions.filter(
        (hash: string) => !receiveReceiptHashes.includes(hash),
    );

    const notificationItemRef = useRef<HTMLDivElement>(null);
    const activityCenterRef = useRef<HTMLDivElement>(null);

    const clickOutsideHandler = (event: Event) => {
        if (
            !activityCenterRef.current?.contains(event?.target as Node) &&
            !notificationItemRef.current?.contains(event?.target as Node)

            // event.target !== activityCenterRef.current &&
            // event.target !== notificationItemRef.current
        ) {
            setShowNotificationTable(false);
        }
    };
    UseOnClickOutside(activityCenterRef, clickOutsideHandler);
    UseOnClickOutside(notificationItemRef, clickOutsideHandler);

    return (
        <AnimateSharedLayout>
            {/* <FocusTrap focusTrapOptions={{ clickOutsideDeactivates: true }}> */}
            <div className={styles.container}>
                <span ref={activityCenterRef}>
                    <ActivityIndicator
                        value={receiveReceiptHashes.length}
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
            {/* </FocusTrap> */}
        </AnimateSharedLayout>
    );
};

export default NotificationCenter;
