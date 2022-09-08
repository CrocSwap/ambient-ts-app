import React, { useState } from 'react';

export const useGlobalModal = (initialMode = false) => {
    // create a useState hook to track if the modal should be rendered
    const [isGlobalModalOpen, setIsGlobalModalOpen] = useState<boolean>(initialMode);

    const [currentContent, setCurrentContent] = useState<React.ReactNode>('I am example content');

    // click handlers to to open and close the modal

    // const openGlobalModal = (page: string) => {
    //   setIsGlobalModalOpen(true)
    //     setCurrentPage(page)

    // }

    const openGlobalModal = (content: React.ReactNode) => {
        setIsGlobalModalOpen(true);
        setCurrentContent(content);
    };
    const closeGlobalModal = () => setIsGlobalModalOpen(false);

    // return all data and functions needed for local use
    return [isGlobalModalOpen, openGlobalModal, closeGlobalModal, currentContent] as const;
};
