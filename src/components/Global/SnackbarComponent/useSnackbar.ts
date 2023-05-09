import { useState } from 'react';

export interface snackbarMethodsIF {
    isOpen: boolean;
    open: (content: string, severity?: snackbarSeverityType) => void;
    close: () => void;
    content: string;
    severity: snackbarSeverityType;
}

export type snackbarSeverityType = 'error' | 'warning' | 'info' | 'success';

export const useSnackbar = (initialMode = false) => {
    const [isOpen, setIsOpen] = useState<boolean>(initialMode);

    const [content, setContent] = useState<string>('');

    const [severity, setSeverity] = useState<snackbarSeverityType>('success');

    const open = (
        content: string,
        severity: snackbarSeverityType = 'success',
    ) => {
        // close current snackbar if open, then reopen with new message
        setIsOpen(false);
        setContent(content);
        setSeverity(severity);
        setIsOpen(true);
    };
    const close = () => {
        setIsOpen(false);
        setContent('');
    };

    return {
        isOpen,
        open,
        close,
        content,
        severity,
    };
};
