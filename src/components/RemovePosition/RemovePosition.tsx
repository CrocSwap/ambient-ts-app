import Modal from '../Global/Modal/Modal';
import styles from './RemovePosition.module.css';
import { useModal } from '../Global/Modal/useModal';
import RemoveRangeWidth from './RemoveRangeWidth/RemoveRangeWidth';
import RemovePositionHeader from './RemovePositionHeader/RemovePositionHeader';
import RemovePositionInfo from './RemovePositionInfo/RemovePositionInfo';
import RemovePositionButton from './RemovePositionButton/RemovePositionButton';

export default function RemovePosition() {
    const [isModalOpen, openModal, closeModal] = useModal();

    const modalContent = <div>I am modal content</div>;

    const chooseTokenModal = (
        <Modal onClose={closeModal} title='Remove Position' content={modalContent}>
            <RemovePositionHeader />
            <div className={styles.main_content}>
                <RemoveRangeWidth />
                <RemovePositionInfo />
                <RemovePositionButton />
            </div>
        </Modal>
    );

    const modalOrNull = isModalOpen ? chooseTokenModal : null;

    return (
        <div className={styles.row}>
            {modalOrNull}
            <button onClick={openModal}>OPEN MODAL</button>
        </div>
    );
}
