import React, {
    useEffect,
    useRef,
    Dispatch,
    SetStateAction,
    useContext,
} from 'react';
import { AnimatePresence, useAnimation, motion } from 'framer-motion';
import styles from './ActivityIndicator.module.css'


import { AppStateContext } from '../../../../contexts/AppStateContext';
import { BrandContext } from '../../../../contexts/BrandContext';

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
    const { appHeaderDropdown } = useContext(AppStateContext);
    const { platformName } = useContext(BrandContext);

    const controls = useAnimation();
    const isFirstRun = useRef(true);

    const { value, pending, showNotificationTable, setShowNotificationTable } =
        props;

    useEffect(() => {
        if (!isFirstRun.current && value > 0) {
            controls.start('pop');
        }
        if (isFirstRun.current) {
            isFirstRun.current = false;
        }
    }, [controls, value]);

    const toggleNotificationCenter: React.MouseEventHandler<
        HTMLButtonElement
    > = () => {
        setShowNotificationTable(!showNotificationTable);
        if (!showNotificationTable) {
            appHeaderDropdown.setIsActive(true);
        } else appHeaderDropdown.setIsActive(false);
    };

    const isFuta = ['futa'].includes(platformName);

    const pendingCircle = (
        <button className={`${styles.circleContainer}${isFuta ? styles.circleContainerFuta : ''}`} onClick={toggleNotificationCenter} >
            <span className={`${styles.ring}${isFuta ? styles.ringFuta : ''}`}  />
        </button>
    );

    if (pending) return pendingCircle;
    return (
        <AnimatePresence>
            {value > 0 && (
                <motion.button className={styles.circleButton}
                    initial={false}
                    exit='hidden'
                    animate='visible'
                    variants={animStates}
                    style={{ cursor: 'pointer' }}
                    onClick={toggleNotificationCenter}
                    tabIndex={0}
                    aria-label='Notification center'
                >
                    <motion.div className={styles.activityIndicatorDiv}
                        style={{borderRadius: isFuta ? '0' : '50%'}}
                        animate={controls}
                        whileHover='hover'
                        whileTap='pressed'
                        variants={animStates}
                        
                    >
                        <span
                            aria-live='polite'
                            aria-atomic='true'
                            aria-relevant='text'
                        >
                            {value}
                        </span>
                    </motion.div>
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default ActivityIndicator;
