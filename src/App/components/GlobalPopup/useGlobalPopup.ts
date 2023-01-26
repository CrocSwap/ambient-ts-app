import React, { useState } from 'react';

export const useGlobalPopup = (initialMode = false) => {
    // create a useState hook to track if the modal should be rendered
    const [isGlobalPopupOpen, setIsGlobalPopupOpen] = useState<boolean>(initialMode);

    const [popupContent, setPopupContent] = useState<React.ReactNode>('I am example content');

    const [popupTitle, setPopupTitle] = useState<string>('');
    const [popupPlacement, setPopupPlacement] = useState('center');

    const openGlobalPopup = (
        content: React.ReactNode,
        popupTitle?: string,
        popupPlacement?: string,
    ) => {
        setIsGlobalPopupOpen(true);
        setPopupContent(content);

        if (popupTitle) {
            setPopupTitle(popupTitle);
        }
        if (popupPlacement) {
            setPopupPlacement(popupPlacement);
        }
    };
    const closeGlobalPopup = () => {
        setPopupContent('');
        setPopupTitle('');
        setIsGlobalPopupOpen(false);
    };

    // return all data and functions needed for local use
    return [
        isGlobalPopupOpen,
        openGlobalPopup,
        closeGlobalPopup,
        popupContent,
        popupTitle,
        popupPlacement,
    ] as const;
};
