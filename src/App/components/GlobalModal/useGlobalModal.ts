import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

export interface globalModalMethodsIF {
    isOpen: boolean;
    open: (
        content: ReactNode,
        title?: string,
        handleBack?: () => void,
        showBackButton?: boolean,
        footer?: ReactNode,
        noBackground?: boolean,
        headerRightItems?: ReactNode,
        onClose?: () => void,
    ) => void;
    close: () => void;
    currentContent: ReactNode;
    title: string;
    handleBack?: () => void;
    showBackButton?: boolean;
    footer?: ReactNode;
    noBackground?: boolean;
    headerRightItems?: ReactNode;
}

export const useGlobalModal = (initialMode = false) => {
    // create a useState hook to track if the modal should be rendered
    const [isOpen, setIsOpen] = useState<boolean>(initialMode);

    const [currentContent, setCurrentContent] = useState<ReactNode>(
        'I am example content',
    );

    const [title, setTitle] = useState<string>('');

    const [handleBack, setHandleBack] = useState<() => void>();
    const [showBackButton, setShowBackButton] = useState(false);
    const [footer, setFooter] = useState<ReactNode>();
    const [noBackground, setNoBackground] = useState(false);
    const [headerRightItems, setHeaderRightItems] = useState<ReactNode>();
    const [onClose, setOnClose] = useState<() => void>();

    const escFunction = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            close();
        }
    }, []);

    useEffect(() => {
        document.addEventListener('keydown', escFunction, false);
        return () => {
            document.removeEventListener('keydown', escFunction, false);
        };
    }, []);

    // click handlers to to open and close the modal
    const open = (
        content: ReactNode,
        title?: string,
        handleBack?: () => void,
        showBackButton?: boolean,
        footer?: ReactNode,
        noBackground?: boolean,
        headerRightItems?: ReactNode,
        onClose?: () => void,
    ) => {
        setIsOpen(true);
        setCurrentContent(content);
        if (title !== undefined) setTitle(title);
        if (handleBack !== undefined) setHandleBack(handleBack);
        if (showBackButton !== undefined) setShowBackButton(showBackButton);
        if (footer !== undefined) setFooter(footer);
        if (noBackground !== undefined) setNoBackground(noBackground);
        if (headerRightItems !== undefined)
            setHeaderRightItems(headerRightItems);
        if (onClose !== undefined) setOnClose(onClose);
    };

    const close = () => {
        setCurrentContent('');
        setTitle('');
        setHandleBack(undefined);
        setShowBackButton(false);
        setFooter(undefined);
        setNoBackground(false);
        setHeaderRightItems(undefined);
        setIsOpen(false);
        onClose && onClose();
    };

    // return all data and functions needed for local use
    return useMemo(
        () => ({
            isOpen,
            open,
            close,
            currentContent,
            title,
            handleBack,
            showBackButton,
            footer,
            noBackground,
            headerRightItems,
        }),
        [
            isOpen,
            currentContent,
            title,
            handleBack,
            showBackButton,
            footer,
            noBackground,
            headerRightItems,
            close,
            initialMode,
        ],
    );
};
