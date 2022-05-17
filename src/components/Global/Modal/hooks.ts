import { useState } from 'react';

export const useModal = (argu: string) => {
    const [showModal, setShowModal] = useState<boolean>(false);

    switch (argu) {
        case 'open':
            setShowModal(true);
            break;
        case 'close':
        default:
            setShowModal(false);
            break;
    }

    return showModal;
};
