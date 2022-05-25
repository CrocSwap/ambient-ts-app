import Modal from '../Global/Modal/Modal';
import styles from './RemovePosition.module.css';
import { useModal } from '../Global/Modal/useModal';

export default function RemovePosition() {
    const [isModalOpen, openModal, closeModal] = useModal();

    const modalContent = <div>I am modal content</div>;

    const chooseTokenModal = (
        <Modal onClose={closeModal} title='Modals title' content={modalContent}>
            {modalContent}
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
