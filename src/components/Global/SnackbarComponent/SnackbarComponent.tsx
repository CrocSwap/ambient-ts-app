// START: Import React and Dongles
import { forwardRef, memo, SyntheticEvent, useContext, useEffect } from 'react';
import { Snackbar } from '@material-ui/core';
import { Alert, AlertProps } from '@mui/material';
import { motion } from 'framer-motion';
import { AppStateContext } from '../../../contexts/AppStateContext';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { IoMdClose } from 'react-icons/io';
import styled from 'styled-components';

const Wrapper = styled.div<{ isSnackbarOpen: boolean }>`
    width: 100%;
    background: rgba(23, 29, 39, 0.25);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    display: ${({ isSnackbarOpen }) => (isSnackbarOpen ? 'flex' : 'none')};
    box-shadow: 100px 100px 100px 50px rgba(0, 0, 0, 0.25);
    justify-content: center;

    position: fixed;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10000000;
`;

const MobileSnackbarWrapper = styled.div<{ isSnackbarOpen: boolean }>`
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;

    gap: 8px;
    padding: 16px;
    background-color: #171d27;
    color: white;
    width: 300px;

    font-size: 12px;
    line-height: 16px;
    backdrop-filter: blur(10px);
    text-align: center;
    word-break: break-word;
`;

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
    const isSmallScreen = useMediaQuery('(max-width: 500px)');

    const {
        snackbar: { isOpen: isSnackbarOpen, close, content, severity },
    } = useContext(AppStateContext);

    const handleClose = (event?: SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        close();
    };

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (isSnackbarOpen && isSmallScreen) {
            timeoutId = setTimeout(() => {
                handleClose();
            }, 8000);
        }

        return () => {
            clearTimeout(timeoutId);
        };
    }, [isSnackbarOpen, handleClose]);

    if (isSmallScreen)
        return (
            <Wrapper isSnackbarOpen={isSnackbarOpen}>
                <MobileSnackbarWrapper isSnackbarOpen={isSnackbarOpen}>
                    {content}

                    <IoMdClose size={25} onClick={handleClose} />
                </MobileSnackbarWrapper>
            </Wrapper>
        );

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
