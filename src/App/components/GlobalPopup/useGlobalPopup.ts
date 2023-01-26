import React, { useState } from 'react';

export const useGlobalPopup = (initialMode = false) => {
    // create a useState hook to track if the modal should be rendered
    const [isGlobalPopupOpen, setIsGlobalPopupOpen] = useState<boolean>(initialMode);

    const [currentContent, setCurrentContent] = useState<React.ReactNode>('I am example content');

    const [title, setTitle] = useState<string>('');

    const openGlobalPopup = (content: React.ReactNode, title?: string) => {
        setIsGlobalPopupOpen(true);
        setCurrentContent(content);

        if (title) {
            setTitle(title);
        }
    };
    const closeGlobalPopup = () => {
        setCurrentContent('');
        setTitle('');
        setIsGlobalPopupOpen(false);
    };

    // return all data and functions needed for local use
    return [isGlobalPopupOpen, openGlobalPopup, closeGlobalPopup, currentContent, title] as const;
};
