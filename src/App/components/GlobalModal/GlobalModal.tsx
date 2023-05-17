import { useContext } from 'react';
import SimpleModal from '../../../components/Global/SimpleModal/SimpleModal';
import { AppStateContext } from '../../../contexts/AppStateContext';

export default function GlobalModal() {
    const {
        globalModal: { isOpen, close, title, currentContent },
    } = useContext(AppStateContext);
    const modalOrNull = isOpen ? (
        <SimpleModal onClose={close} title={title}>
            {currentContent}
        </SimpleModal>
    ) : null;

    return <>{modalOrNull}</>;
}
