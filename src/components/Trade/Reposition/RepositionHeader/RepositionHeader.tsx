import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
import { RiArrowLeftLine, RiSettings5Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import trimString from '../../../../utils/functions/trimString';
import styles from './RepositionHeader.module.css';
import TransactionSettings from '../../../Global/TransactionSettings/TransactionSettings';
import Modal from '../../../../components/Global/Modal/Modal';
import { useModal } from '../../../../components/Global/Modal/useModal';
import { SlippagePairIF } from '../../../../utils/interfaces/exports';

interface propsIF {
    positionHash: string;
    redirectPath: string;
    repoSlippage: SlippagePairIF;
    isPairStable: boolean;
    bypassConfirm: boolean;
    toggleBypassConfirm: (item: string, pref: boolean) => void;
}

export default function RepositionHeader(props: propsIF) {
    const {
        positionHash,
        redirectPath,
        repoSlippage,
        isPairStable,
        bypassConfirm,
        toggleBypassConfirm,
    } = props;

    const navigate = useNavigate();

    const [isModalOpen, openModal, closeModal] = useModal();

    return (
        <ContentHeader>
            <div
                onClick={() => navigate(redirectPath, { replace: true })}
                style={{ cursor: 'pointer' }}
            >
                <RiArrowLeftLine />
            </div>
            <div className={styles.title}>Reposition: {trimString(positionHash, 4, 4, '…')}</div>
            <div onClick={() => openModal()} style={{ cursor: 'pointer' }}>
                <RiSettings5Line />
            </div>
            {isModalOpen && (
                <Modal noHeader title='modal' onClose={closeModal}>
                    <TransactionSettings
                        module='Reposition'
                        toggleFor='repo'
                        slippage={repoSlippage}
                        isPairStable={isPairStable}
                        onClose={closeModal}
                        bypassConfirm={bypassConfirm}
                        toggleBypassConfirm={toggleBypassConfirm}
                    />
                </Modal>
            )}
        </ContentHeader>
    );
}
