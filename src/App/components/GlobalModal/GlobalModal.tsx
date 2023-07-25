import { useContext } from 'react';
import { AppStateContext } from '../../../contexts/AppStateContext';
import Modal from '../../../components/Global/Modal/Modal';

export default function GlobalModal() {
    const {
        globalModal: {
            isOpen,
            close,
            title,
            currentContent,
            handleBack,
            showBackButton,
            footer,
            noBackground,
            headerRightItems,
        },
    } = useContext(AppStateContext);
    const modalOrNull = isOpen ? (
        <Modal
            centeredTitle
            noHeader={title === ''}
            onClose={close}
            title={title}
            handleBack={handleBack}
            showBackButton={showBackButton}
            footer={footer}
            noBackground={noBackground}
            headerRightItems={headerRightItems}
        >
            {currentContent}
        </Modal>
    ) : null;

    return <>{modalOrNull}</>;
}
