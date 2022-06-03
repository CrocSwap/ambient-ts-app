import { useState } from 'react';

export const useRelativeModal = (initialMode = false) => {
    // create a useState hook to track if the modal should be rendered
    const [isRelativeModalOpen, setIsRelativeModalOpen] = useState<boolean>(initialMode);

    // click handlers to to open and close the Relativemodal
    const openRelativeModal = () => setIsRelativeModalOpen(true);
    const closeRelativeModal = () => setIsRelativeModalOpen(false);

    // return all data and functions needed for local use
    return [isRelativeModalOpen, openRelativeModal, closeRelativeModal] as const;
};
