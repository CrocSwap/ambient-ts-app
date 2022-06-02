import styles from './SwapHeader.module.css';
import { MdShowChart } from 'react-icons/md';
import Modal from '../../../components/Global/Modal/Modal';
import { useModal } from '../../../components/Global/Modal/useModal';

import ContentHeader from '../../Global/ContentHeader/ContentHeader';
import settingsIcon from '../../../assets/images/icons/settings.svg';
import TransactionSettings from '../../Global/TransactionSettings/TransactionSettings';

interface swapHeaderProps {
    isOnTradeRoute?: boolean;
}

export default function SwapHeader(props: swapHeaderProps) {
    const { isOnTradeRoute } = props;
    const [isModalOpen, openModal, closeModal] = useModal();

    const settingsModalOrNull = isModalOpen ? (
        <Modal noHeader title='modal' onClose={closeModal}>
            <TransactionSettings />
        </Modal>
    ) : null;

    const tradeRouteHeader = (
        <ContentHeader>
            <span />
            <div className={styles.token_info}>ETH / USDC</div>
            <div onClick={openModal}>
                <img src={settingsIcon} alt='settings' />
            </div>
        </ContentHeader>
    );

    const mainHeader = (
        <ContentHeader>
            <span>
                <MdShowChart />
            </span>
            <span className={styles.title}>Swap</span>
            <div className={styles.settings_container} onClick={openModal}>
                <img src={settingsIcon} alt='settings' />
            </div>
        </ContentHeader>
    );

    return (
        <>
            {isOnTradeRoute ? tradeRouteHeader : mainHeader}
            {settingsModalOrNull}
        </>
    );
}
