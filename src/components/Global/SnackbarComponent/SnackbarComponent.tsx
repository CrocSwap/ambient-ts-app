// START: Import React and Dongles
import {
    forwardRef,
    Dispatch,
    SetStateAction,
    ReactNode,
    SyntheticEvent,
} from 'react';
import { Snackbar } from '@material-ui/core';
import { Alert, AlertProps, AlertColor } from '@mui/material';
import { motion } from 'framer-motion';

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

// interface for React functional component props
interface SnackbarPropsIF {
    children: ReactNode;
    severity: AlertColor;
    setOpenSnackbar: Dispatch<SetStateAction<boolean>>;
    openSnackbar: boolean;
}

// React functional component
export default function SnackbarComponent(props: SnackbarPropsIF) {
    const { openSnackbar, setOpenSnackbar, children, severity } = props;

    const handleClose = (event?: SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    return (
        <motion.div>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={8000}
                onClose={handleClose}
                style={{ width: '900px' }}
            >
                <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <SnackbarAlert onClose={handleClose} severity={severity}>
                        {children}
                    </SnackbarAlert>
                </motion.div>
            </Snackbar>
        </motion.div>
    );
}
