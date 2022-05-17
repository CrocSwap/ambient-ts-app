import { useState } from 'react';

export const useModal = (initialMode = false) => {
    // create a useState hook to track if the modal should be rendered
    const [isModalOpen, setIsModalOpen] = useState<boolean>(initialMode);

    // click handlers to to open and close the modal
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // return all data and functions needed for local use
    return [isModalOpen, openModal, closeModal] as const;
};
