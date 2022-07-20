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
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';

// interface for props
interface swapHeaderPropsIF {
    tokenPair: TokenPairIF;
    isOnTradeRoute?: boolean;
    isDenomBase: boolean;
    isTokenABase: boolean;
}

// main react functional component
export default function SwapHeader(props: swapHeaderPropsIF) {
    const { tokenPair, isOnTradeRoute, isDenomBase, isTokenABase } = props;
    const [isModalOpen, openModal, closeModal] = useModal();

    const dispatch = useAppDispatch();

    const reverseDisplay = (isTokenABase && isDenomBase) || (!isTokenABase && !isDenomBase);

    const settingsModalOrNull = isModalOpen ? (
        <Modal noHeader title='modal' onClose={closeModal}>
            <TransactionSettings
                module={isOnTradeRoute ? 'Market Order' : 'Swap'}
                onClose={closeModal}
            />
        </Modal>
    ) : null;

    const tradeRouteHeader = (
        <ContentHeader>
            <span />
            <div className={styles.token_info} onClick={() => dispatch(toggleDidUserFlipDenom())}>
                {reverseDisplay ? tokenPair.dataTokenA.symbol : tokenPair.dataTokenB.symbol} /{' '}
                {reverseDisplay ? tokenPair.dataTokenB.symbol : tokenPair.dataTokenA.symbol}
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
