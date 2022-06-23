// START: Import React and Dongles
import { MdShowChart } from 'react-icons/md';

// START: Import React Functional Components
import Modal from '../../../components/Global/Modal/Modal';
import { useModal } from '../../../components/Global/Modal/useModal';
import ContentHeader from '../../Global/ContentHeader/ContentHeader';
import TransactionSettings from '../../Global/TransactionSettings/TransactionSettings';

// START: Import Local Files
import styles from './SwapHeader.module.css';
import settingsIcon from '../../../assets/images/icons/settings.svg';
import { TokenPairIF } from '../../../utils/interfaces/exports';

// interface for props
interface swapHeaderPropsIF {
    tokenPair: TokenPairIF;
    isOnTradeRoute?: boolean;
    isDenomBase: boolean;
}

// main react functional component
export default function SwapHeader(props: swapHeaderPropsIF) {
    const { tokenPair, isOnTradeRoute, isDenomBase } = props;
    const [isModalOpen, openModal, closeModal] = useModal();

    const settingsModalOrNull = isModalOpen ? (
        <Modal noHeader title='modal' onClose={closeModal}>
            <TransactionSettings />
        </Modal>
    ) : null;

    const tradeRouteHeader = (
        <ContentHeader>
            <span />
            <div className={styles.token_info}>
                {isDenomBase ? tokenPair.dataTokenA.symbol : tokenPair.dataTokenB.symbol} /{' '}
                {isDenomBase ? tokenPair.dataTokenB.symbol : tokenPair.dataTokenA.symbol}
            </div>
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
