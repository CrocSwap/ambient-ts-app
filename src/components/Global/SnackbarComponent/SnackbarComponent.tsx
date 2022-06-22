import { Snackbar } from '@material-ui/core';
import { Alert, AlertProps, AlertColor } from '@mui/material';
import { motion } from 'framer-motion';

import { forwardRef, SetStateAction } from 'react';

const SnackbarAlert = forwardRef<HTMLDivElement, AlertProps>(function SnackbarAlert(props, ref) {
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
});

interface SnackbarProps {
    children: React.ReactNode;
    severity: AlertColor;
    setOpenSnackbar: React.Dispatch<SetStateAction<boolean>>;
    openSnackbar: boolean;
}

export default function SnackbarComponent(props: SnackbarProps) {
    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        props.setOpenSnackbar(false);
    };
    return (
        <motion.div>
            <Snackbar open={props.openSnackbar} autoHideDuration={8000} onClose={handleClose}>
                <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <SnackbarAlert onClose={handleClose} severity={props.severity}>
                        {props.children}
                    </SnackbarAlert>
                </motion.div>
            </Snackbar>
        </motion.div>
    );
}
