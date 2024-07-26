import { useMemo, useState } from 'react';

export interface SnackbarOrigin {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
}

export type snackbarSeverityType = 'error' | 'warning' | 'info' | 'success';

export interface snackbarMethodsIF {
    isOpen: boolean;
    open: (
        content: string | JSX.Element,
        severity?: snackbarSeverityType,
        anchorOrigin?: SnackbarOrigin,
    ) => void;
    close: () => void;
    content: string | JSX.Element;
    severity: snackbarSeverityType;
    anchorOrigin: SnackbarOrigin;
}

export const useSnackbar = (initialMode = false): snackbarMethodsIF => {
    const [isOpen, setIsOpen] = useState<boolean>(initialMode);
    const [content, setContent] = useState<string | JSX.Element>('');
    const [severity, setSeverity] = useState<snackbarSeverityType>('success');
    const [anchorOrigin, setAnchorOrigin] = useState<SnackbarOrigin>({
        vertical: 'bottom',
        horizontal: 'center',
    });

    const open = (
        content: string | JSX.Element,
        severity: snackbarSeverityType = 'success',
        anchorOrigin: SnackbarOrigin = {
            vertical: 'bottom',
            horizontal: 'center',
        },
    ) => {
        setIsOpen(false);
        setContent(content);
        setSeverity(severity);
        setAnchorOrigin(anchorOrigin);
        setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
        setContent('');
    };

    return useMemo(
        () => ({
            isOpen,
            open,
            close,
            content,
            severity,
            anchorOrigin,
        }),
        [isOpen, content, severity, anchorOrigin, initialMode],
    );
};
