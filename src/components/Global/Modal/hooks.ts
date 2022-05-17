import { useState } from 'react';
export const useModal = (initialMode = false) => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(initialMode);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return [isModalOpen, openModal, closeModal] as const;
};
