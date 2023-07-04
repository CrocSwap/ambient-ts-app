import { ReactNode, useMemo, useState } from 'react';

export interface globalPopupMethodsIF {
    isOpen: boolean;
    open: (content: ReactNode, title: string, placement: string) => void;
    close: () => void;
    content: ReactNode;
    title: string;
    placement: string;
}

export const useGlobalPopup = (initialMode = false): globalPopupMethodsIF => {
    // create a useState hook to track if the modal should be rendered
    const [isOpen, setIsOpen] = useState<boolean>(initialMode);

    const [content, setContent] = useState<ReactNode>('I am example content');

    const [title, setTitle] = useState<string>('');
    const [placement, setPlacement] = useState('center');

    const open = (
        content: ReactNode,
        popupTitle?: string,
        popupPlacement?: string,
    ) => {
        setIsOpen(true);
        setContent(content);

        if (popupTitle) {
            setTitle(popupTitle);
        }
        if (popupPlacement) {
            setPlacement(popupPlacement);
        }
    };
    const close = () => {
        setPlacement('');
        setTitle('');
        setIsOpen(false);
    };

    // return all data and functions needed for local use
    return useMemo(
        () => ({
            isOpen,
            open,
            close,
            content,
            title,
            placement,
        }),
        [isOpen, content, title, placement, initialMode],
    );
};
