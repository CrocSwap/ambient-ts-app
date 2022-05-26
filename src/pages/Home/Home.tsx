import Modal from '../../components/Global/Modal/Modal';
import { useModal } from '../../components/Global/Modal/useModal';
import ambientLogo from '../../assets/images/logos/ambient_logo.svg';
import styles from './Home.module.css';

export default function Home() {
    const [isModalOpen, openModal, closeModal] = useModal();

    const modalContent = <div>I am modal content</div>;

    const chooseTokenModal = (
        <Modal onClose={closeModal} title='Modals title' content={modalContent}>
            {modalContent}
        </Modal>
    );

    const modalOrNull = isModalOpen ? chooseTokenModal : null;

    const ambientImage = (
        <div className={styles.ambient_image}>
            <img src={ambientLogo} alt='ambient' />
        </div>
    );

    const ambientText = (
        <div className={styles.text_container}>
            <div className={`${styles.sign} ${styles.light}`} id='one'>
                A
            </div>
            <div className={`${styles.sign} ${styles.light}`} id='two'>
                M
            </div>
            <div className={`${styles.sign} ${styles.light}`} id='three'>
                B
            </div>
            <div className={`${styles.sign} ${styles.light}`} id='four'>
                I
            </div>
            <div className={`${styles.sign} ${styles.non_light}`} id='four'>
                E
            </div>
            <div className={`${styles.sign} ${styles.non_light}`} id='four'>
                N
            </div>
            <div className={`${styles.sign} ${styles.non_light}`} id='four'>
                T
            </div>
        </div>
    );

    return (
        <main data-testid={'home'} className={styles.home_container}>
            {/* {ambientImage} */}
            {ambientText}
        </main>
    );
}
