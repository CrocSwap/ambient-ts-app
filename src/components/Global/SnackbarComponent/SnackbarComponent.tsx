// START: Import React and Dongles
import { forwardRef, memo, SyntheticEvent, useContext } from 'react';
import { Snackbar } from '@material-ui/core';
import { Alert, AlertProps } from '@mui/material';
import { motion } from 'framer-motion';
import { AppStateContext } from '../../../contexts/AppStateContext';

const SnackbarAlert = forwardRef<HTMLDivElement, AlertProps>(
    function SnackbarAlert(props, ref) {
        return (
            <Alert
                elevation={6}
                ref={ref}
                {...props}
                sx={{
                    backgroundColor: '#171D27',
                    color: 'white',
                }}
            />
        );
    },
);

// React functional component
function SnackbarComponent() {
    const {
        snackbar: { isOpen: isSnackbarOpen, close, content, severity },
    } = useContext(AppStateContext);

    const handleClose = (event?: SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        close();
    };

    return (
        <motion.div>
            <Snackbar
                open={isSnackbarOpen}
                autoHideDuration={8000}
                onClose={handleClose}
                // z-index needs to be greater than globalPopup
                style={{ width: '900px', zIndex: 10000000 }}
            >
                <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <SnackbarAlert onClose={handleClose} severity={severity}>
                        {content}
                    </SnackbarAlert>
                </motion.div>
            </Snackbar>
        </motion.div>
    );
}

export default memo(SnackbarComponent);
