import {
    memo,
    SyntheticEvent,
    useContext,
    useRef,
    useEffect,
    useState,
} from 'react';
import { AppStateContext } from '../../../contexts/AppStateContext';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import { CustomSnackbar, SnackbarAlert } from './CustomSnackbar';
import styles from './SnackbarComponent.module.css';

const AUTO_HIDE_DURATION = 8000;

// React functional component
function SnackbarComponent() {
    const isSmallScreen = useMediaQuery('(max-width: 500px)');
    const { snackbar } = useContext(AppStateContext);
    const { isOpen, close, content, severity, anchorOrigin } = snackbar;

    const snackbarRef = useRef<HTMLDivElement>(null);

    const handleClose = (event?: SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        close();
    };

    // Track if the component is mounted
    const [mounted, setMounted] = useState(false);
    const [show, setShow] = useState(false);

    // Set mounted flag on component mount
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Handle showing/hiding the snackbar
    useEffect(() => {
        if (isOpen) {
            setShow(true);
        } else {
            // Delay hiding to allow for exit animation
            const timer = setTimeout(() => setShow(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Auto-hide the snackbar
    useEffect(() => {
        if (!isOpen) return;

        const timer = setTimeout(() => {
            if (mounted) {
                handleClose();
            }
        }, AUTO_HIDE_DURATION);

        return () => clearTimeout(timer);
    }, [isOpen, content, mounted]);

    useOnClickOutside(snackbarRef, () => {
        if (isOpen) {
            handleClose();
        }
    });

    if (!show) return null;

    return (
        <div
            ref={snackbarRef}
            className={styles.snackbar_container}
            data-testid='snackbar-container'
        >
            <CustomSnackbar
                open={isOpen}
                autoHideDuration={AUTO_HIDE_DURATION}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: isSmallScreen ? 'top' : anchorOrigin.vertical,
                    horizontal: isSmallScreen
                        ? 'center'
                        : anchorOrigin.horizontal,
                }}
            >
                <SnackbarAlert
                    severity={severity}
                    onClose={handleClose}
                    className={styles.snackbar_alert}
                    data-testid='snackbar-alert'
                >
                    <div className={styles.snackbar_content}>
                        <div className={styles.message_container}>
                            <div className={styles.message}>{content}</div>
                        </div>
                    </div>
                </SnackbarAlert>
            </CustomSnackbar>
        </div>
    );
}

export default memo(SnackbarComponent);
