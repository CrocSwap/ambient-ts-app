// START: Import React and Dongles
import { FiSettings } from 'react-icons/fi';

// START: Import React Functional Components
import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
import TransactionSettings from '../../../Global/TransactionSettings/TransactionSettings';

// START: Import Local Files
import styles from './LimitHeader.module.css';
import { TokenPairIF } from '../../../../utils/interfaces/exports';
import settingsIcon from '../../../../assets/images/icons/settings.svg';
import Modal from '../../../../components/Global/Modal/Modal';
import { useModal } from '../../../../components/Global/Modal/useModal';

// interface for component props
interface LimitHeaderPropsIF {
    tokenPair: TokenPairIF;
    isDenomBase: boolean;
}

// central react functional component
export default function LimitHeader(props: LimitHeaderPropsIF) {
    const { tokenPair, isDenomBase } = props;

    const [isModalOpen, openModal, closeModal] = useModal();

    const settingsModalOrNull = isModalOpen ? (
        <Modal noHeader title='modal' onClose={closeModal}>
            <TransactionSettings />
        </Modal>
    ) : null;

    return (
        <ContentHeader>
            <span />
            <div className={styles.token_info}>
                {isDenomBase ? tokenPair.dataTokenA.symbol : tokenPair.dataTokenB.symbol} /{' '}
                {isDenomBase ? tokenPair.dataTokenB.symbol : tokenPair.dataTokenA.symbol}
            </div>
            <div onClick={openModal}>
                <img src={settingsIcon} alt='settings' />
            </div>
            {settingsModalOrNull}
        </ContentHeader>
    );
}
