import { useCallback, useState } from 'react';
import useKeyPress from '../../../App/hooks/useKeyPress';
import { GLOBAL_MODAL_COMPONENT_ID } from '../../../constants';

export const useModal = (
    modalCloseCustom?: () => void,
    initialMode = false,
): [boolean, () => void, () => void] => {
    // create a useState hook to track if the modal should be rendered
    const [isModalOpen, setIsModalOpen] = useState<boolean>(initialMode);

    // TODO:  'closeModalEvent' is a magic value (must be defined in multiple files)
    // TODO:  ... we should rework things such that it only needs to be defined once

    // click handlers to to open and close the modal
    const openModal = useCallback((): void => setIsModalOpen(true), []);
    const closeModal = useCallback((): void => {
        // close the modal
        setIsModalOpen(false);
        // emit a custom event to trigger extra functionality on modal close
        const closeEvent = new CustomEvent('closeModalEvent', {
            bubbles: true,
        });

        // dispatch the event on the modal being closed
        document
            .getElementById(GLOBAL_MODAL_COMPONENT_ID)
            ?.dispatchEvent(closeEvent);

        // remove the event listener from  the window
        // the presence of a close function implies the event listener was created
        modalCloseCustom &&
            window.removeEventListener('closeModalEvent', modalCloseCustom);
    }, [modalCloseCustom]);

    useKeyPress('Escape', closeModal);

    // return all data and functions needed for local use
    return [isModalOpen, openModal, closeModal];
};
