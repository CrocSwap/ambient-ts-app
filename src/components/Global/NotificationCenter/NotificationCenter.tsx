import { AnimateSharedLayout } from 'framer-motion';
import { useEffect, useRef, useState, useMemo, useContext } from 'react';
import NotificationTable from './NotificationTable/NotificationTable';
import ActivityIndicator from './ActivityIndicator/ActivityIndicator';
import UseOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import { getReceiptTxHashes } from '../../../ambient-utils/dataLayer';
import { ReceiptContext } from '../../../contexts/ReceiptContext';
import Modal from '../Modal/Modal';
import ModalHeader from '../ModalHeader/ModalHeader';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';

const NotificationCenter = () => {

    const showMobileVersion = useMediaQuery('(max-width: 768px)');

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

    const modalVersion = (
        <Modal usingCustomHeader onClose={() => setShowNotificationTable(false)}>
            <ModalHeader title={'Recent Transactions'} onClose={() => setShowNotificationTable(false)} />
            <NotificationTable
                        showNotificationTable={showNotificationTable}
                        setShowNotificationTable={setShowNotificationTable}
                        pendingTransactions={currentPendingTransactionsArray}
                        notificationItemRef={notificationItemRef}
                    />
            </Modal>
    )

    if ( showMobileVersion &&  showNotificationTable) return modalVersion

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
