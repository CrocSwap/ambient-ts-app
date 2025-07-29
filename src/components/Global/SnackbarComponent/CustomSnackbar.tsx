import { motion } from 'framer-motion';
import { forwardRef, ReactNode, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import styles from './SnackbarComponent.module.css';

interface SnackbarAlertProps {
    severity?: 'error' | 'info' | 'success' | 'warning';
    children: ReactNode;
    onClose?: () => void;
    className?: string;
}

export const SnackbarAlert = forwardRef<HTMLDivElement, SnackbarAlertProps>(
    ({ severity = 'info', children, onClose, className = '' }, ref) => {
        return (
            <div
                ref={ref}
                className={`${styles.alert} ${styles[severity]} ${className}`}
                role='alert'
            >
                <div className={styles.alertContent}>{children}</div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className={styles.closeButton}
                        aria-label='Close'
                    >
                        <IoMdClose size={20} />
                    </button>
                )}
            </div>
        );
    },
);

interface CustomSnackbarProps {
    open: boolean;
    onClose: () => void;
    autoHideDuration?: number;
    children: ReactNode;
    anchorOrigin?: {
        vertical: 'top' | 'bottom';
        horizontal: 'left' | 'center' | 'right';
    };
}

export const CustomSnackbar = ({
    open,
    onClose,
    autoHideDuration = 8000,
    children,
    anchorOrigin = { vertical: 'bottom', horizontal: 'center' },
}: CustomSnackbarProps) => {
    // Don't render anything if not open
    if (!open) return null;

    // Auto-hide functionality
    useEffect(() => {
        if (!open || autoHideDuration <= 0) return;

        const timer = setTimeout(() => {
            onClose();
        }, autoHideDuration);

        return () => clearTimeout(timer);
    }, [open, autoHideDuration, onClose]);

    return (
        <motion.div
            className={`${styles.snackbar} ${styles[anchorOrigin.vertical]} ${
                styles[anchorOrigin.horizontal]
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            role='alert'
            aria-live='assertive'
        >
            {children}
        </motion.div>
    );
};
