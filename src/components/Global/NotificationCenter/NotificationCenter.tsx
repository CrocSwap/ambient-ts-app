import styles from './NotificationCenter.module.css';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import React, { useEffect, useRef, Dispatch, SetStateAction } from 'react';
import NotificationTable from './NotificationTable/NotificationTable';
import ActivityIndicator from './ActivityIndicator/ActivityIndicator';

const animStates = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
    pop: { scale: [1.3, 1], opacity: 1 },
    hover: { scale: 1.1 },
    pressed: { scale: 0.95 },
};

interface NotificationCenterPropsIF {
    value: number;
    pending: boolean;

    showNotificationTable: boolean;
    setShowNotificationTable: Dispatch<SetStateAction<boolean>>;
}

const NotificationCenter = (props: NotificationCenterPropsIF) => {
    const { value, pending, showNotificationTable, setShowNotificationTable } = props;

    return (
        <div className={styles.container}>
            <ActivityIndicator
                value={value}
                pending={pending}
                showNotificationTable={showNotificationTable}
                setShowNotificationTable={setShowNotificationTable}
            />

            <NotificationTable
                showNotificationTable={showNotificationTable}
                setShowNotificationTable={setShowNotificationTable}
            />
        </div>
    );
};

export default NotificationCenter;
