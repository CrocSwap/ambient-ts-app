import { useContext } from 'react';
import { AppStateContext } from '../../../contexts/AppStateContext';
import Modal from '../../../components/Global/Modal/Modal';

export default function GlobalModal() {
    const {
        globalModal: { isOpen, close, title, currentContent },
    } = useContext(AppStateContext);
    console.log({ title });
    const modalOrNull = isOpen ? (
        <Modal
            onClose={close}
            title={title}
            centeredTitle
            noHeader={title === ''}
        >
            {currentContent}
        </Modal>
    ) : null;

    return <>{modalOrNull}</>;
}
