import styles from './SwitchNetwork.module.css';
import Modal from '../../Modal/Modal';
import { useModal } from '../../Modal/useModal';
import { RiErrorWarningLine } from 'react-icons/ri';
import NetworkButton from '../NetworkButton/NetworkButton';

interface SwitchNetworkProps {
    showSwitchNetwork: boolean;
}

export default function SwitchNetwork(props: SwitchNetworkProps) {
    const { showSwitchNetwork } = props;

    const [
        // eslint-disable-next-line
        isModalOpen,
        openModal,

        closeModal,
    ] = useModal();

    const modalTitle = 'Unsupported Network';

    const modalContent = (
        <div className={styles.outside_modal}>
            <div className={styles.modal}>
                <header className={styles.modal_header}>
                    <RiErrorWarningLine size={20} color='#ffffff' />
                    <h2>Unsupported Network</h2>
                </header>
                <section className={`${styles.modal_content} `}>
                    <span className={styles.content_title}>Please choose a network below</span>
                    <NetworkButton />
                </section>
            </div>
        </div>
    );

    const mainModal = (
        <Modal onClose={closeModal} title={modalTitle} noHeader>
            {modalContent}
        </Modal>
    );
    const modalOrNull = showSwitchNetwork ? mainModal : null;

    return <>{modalOrNull}</>;
}
