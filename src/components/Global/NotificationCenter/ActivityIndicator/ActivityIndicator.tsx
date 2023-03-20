import React, { useEffect, useRef, Dispatch, SetStateAction } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

import styles from './ActivityIndicator.module.css';

interface AcitivtyIndicatorProps {
    value: number;
    pending: boolean;

    showNotificationTable: boolean;
    setShowNotificationTable: Dispatch<SetStateAction<boolean>>;
}
const animStates = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
    pop: { scale: [1.3, 1], opacity: 1 },
    hover: { scale: 1.1 },
    pressed: { scale: 0.95 },
};
const ActivityIndicator = (props: AcitivtyIndicatorProps) => {
    const controls = useAnimation();
    const isFirstRun = useRef(true);

    const { value, pending, showNotificationTable, setShowNotificationTable } = props;

    useEffect(() => {
        if (!isFirstRun.current && value > 0) {
            controls.start('pop');
        }
        if (isFirstRun.current) {
            isFirstRun.current = false;
        }
    }, [controls, value]);

    const toggleNotificationCenter: React.MouseEventHandler<HTMLDivElement> = () => {
        setShowNotificationTable(!showNotificationTable);
    };

    const pendingCircle = (
        <div className={styles.circle} onClick={toggleNotificationCenter}>
            <div className={styles.ring} />
        </div>
    );

    if (pending) return pendingCircle;
    return (
        <AnimatePresence>
            {value > 0 && (
                <motion.div
                    initial={false}
                    exit='hidden'
                    animate='visible'
                    variants={animStates}
                    style={{ cursor: 'pointer' }}
                    onClick={toggleNotificationCenter}
                >
                    <motion.div
                        className={styles.activity_indicator}
                        animate={controls}
                        whileHover='hover'
                        whileTap='pressed'
                        variants={animStates}
                    >
                        <span>{value}</span>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ActivityIndicator;
