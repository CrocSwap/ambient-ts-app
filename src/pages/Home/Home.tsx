import Modal from '../../components/Global/Modal/Modal';
import { useModal } from '../../components/Global/Modal/useModal';
import RemovePosition from '../../components/RemovePosition/RemovePosition';

export default function Home() {
    const [isModalOpen, openModal, closeModal] = useModal();

    const modalContent = <div>I am modal content</div>;

    const chooseTokenModal = (
        <Modal onClose={closeModal} title='Modals title' content={modalContent}>
            {modalContent}
        </Modal>
    );

    const modalOrNull = isModalOpen ? chooseTokenModal : null;

    return (
        <main data-testid={'home'}>
            <h1>This is Home.tsx</h1>
            {modalOrNull}
            <button onClick={openModal}>OPEN MODAL</button>
            <RemovePosition />
        </main>
    );
}
