import React, { useState } from 'react';

export const useGlobalModal = (initialMode = false) => {
    // create a useState hook to track if the modal should be rendered
    const [isGlobalModalOpen, setIsGlobalModalOpen] = useState<boolean>(initialMode);

    const [currentContent, setCurrentContent] = useState<React.ReactNode>('I am example content');

    const [title, setTitle] = useState<string>('');

    // click handlers to to open and close the modal

    // const openGlobalModal = (page: string) => {
    //   setIsGlobalModalOpen(true)
    //     setCurrentPage(page)

    // }

    const openGlobalModal = (content: React.ReactNode, title?: string) => {
        setIsGlobalModalOpen(true);
        setCurrentContent(content);

        if (title) {
            setTitle(title);
        }
    };
    const closeGlobalModal = () => {
        setCurrentContent('');
        setTitle('');
        setIsGlobalModalOpen(false);
    };

    // return all data and functions needed for local use
    return [isGlobalModalOpen, openGlobalModal, closeGlobalModal, currentContent, title] as const;
};
