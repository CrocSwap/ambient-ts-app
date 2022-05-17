import Modal from '../../components/Global/Modal/Modal';
import { useModal } from '../../components/Global/Modal/hooks';
export default function Home() {
    const [isModalOpen, openModal, closeModal] = useModal();

    const modalContent = <div>I am modal content</div>;

    const modalOrNull = isModalOpen ? (
        <Modal onClose={closeModal} title='Modals title' content={modalContent} />
    ) : null;

    return (
        <main data-testid={'home'}>
            <h1>This is Home.tsx</h1>
            {modalOrNull}
            <button onClick={openModal}>OPEN MODAL</button>
        </main>
    );
}
