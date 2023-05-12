import { ReactNode, useState } from 'react';

export interface globalModalMethodsIF {
    isOpen: boolean;
    open: (content: ReactNode, title?: string) => void;
    close: () => void;
    currentContent: ReactNode;
    title: string;
}

export const useGlobalModal = (initialMode = false) => {
    // create a useState hook to track if the modal should be rendered
    const [isOpen, setIsOpen] = useState<boolean>(initialMode);

    const [currentContent, setCurrentContent] = useState<ReactNode>(
        'I am example content',
    );

    const [title, setTitle] = useState<string>('');

    // click handlers to to open and close the modal
    const open = (content: ReactNode, title?: string) => {
        setIsOpen(true);
        setCurrentContent(content);

        if (title) {
            setTitle(title);
        }
    };
    const close = () => {
        setCurrentContent('');
        setTitle('');
        setIsOpen(false);
    };

    // return all data and functions needed for local use
    return {
        isOpen,
        open,
        close,
        currentContent,
        title,
    };
};
