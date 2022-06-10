import { Snackbar } from '@material-ui/core';
import { Alert, AlertProps, AlertColor } from '@mui/material';

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
        <>
            <Snackbar open={props.openSnackbar} autoHideDuration={4000} onClose={handleClose}>
                <SnackbarAlert onClose={handleClose} severity={props.severity}>
                    {props.children}
                </SnackbarAlert>
            </Snackbar>
        </>
    );
}
