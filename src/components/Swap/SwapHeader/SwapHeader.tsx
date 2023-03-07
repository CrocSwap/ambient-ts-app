// START: Import React Functional Components
import Modal from '../../../components/Global/Modal/Modal';
import ContentHeader from '../../Global/ContentHeader/ContentHeader';
import TransactionSettings from '../../Global/TransactionSettings/TransactionSettings';

// START: Import Local Files
import styles from './SwapHeader.module.css';
import { useModal } from '../../../components/Global/Modal/useModal';
import settingsIcon from '../../../assets/images/icons/settings.svg';
import { useAppDispatch, useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';
import { AiOutlineShareAlt } from 'react-icons/ai';
import ShareModal from '../../Global/ShareModal/ShareModal';
import { SlippageMethodsIF } from '../../../App/hooks/useSlippage';

// interface for props
interface propsIF {
    swapSlippage: SlippageMethodsIF;
    isPairStable: boolean;
    isOnTradeRoute?: boolean;
    openGlobalModal: (content: React.ReactNode, title?: string) => void;
    bypassConfirm: boolean;
    toggleBypassConfirm: (item: string, pref: boolean) => void;
    shareOptionsDisplay: JSX.Element;
}

// main react functional component
export default function SwapHeader(props: propsIF) {
    const {
        swapSlippage,
        isPairStable,
        isOnTradeRoute,
        openGlobalModal,
        bypassConfirm,
        toggleBypassConfirm,
    } = props;
    const [isModalOpen, openModal, closeModal] = useModal();

    const dispatch = useAppDispatch();

    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase = tradeData.isDenomBase;

    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

    const settingsModalOrNull = isModalOpen ? (
        <Modal noHeader title='modal' onClose={closeModal}>
            <TransactionSettings
                module={isOnTradeRoute ? 'Market Order' : 'Swap'}
                toggleFor='swap'
                slippage={swapSlippage}
                isPairStable={isPairStable}
                onClose={closeModal}
                bypassConfirm={bypassConfirm}
                toggleBypassConfirm={toggleBypassConfirm}
            />
        </Modal>
    ) : null;

    const tradeRouteHeader = (
        <ContentHeader>
            <div
                className={styles.share_button}
                onClick={() => openGlobalModal(<ShareModal />, 'Share')}
                id='swap_share_button'
            >
                <AiOutlineShareAlt />
            </div>
            <div className={styles.token_info} onClick={() => dispatch(toggleDidUserFlipDenom())}>
                {isDenomBase ? baseTokenSymbol : quoteTokenSymbol} /{' '}
                {isDenomBase ? quoteTokenSymbol : baseTokenSymbol}
            </div>

            <IconWithTooltip title='Settings' placement='left'>
                <div
                    onClick={openModal}
                    style={{ cursor: 'pointer' }}
                    className={`${styles.settings_container} ${styles.settings_icon}`}
                    id='swap_settings_button'
                >
                    <img src={settingsIcon} alt='settings' />
                </div>
            </IconWithTooltip>
        </ContentHeader>
    );

    const mainHeader = (
        <ContentHeader>
            <div
                className={styles.share_button}
                id='swap_share_button'
                onClick={() => openGlobalModal(<ShareModal />, 'Share')}
            >
                <AiOutlineShareAlt />
            </div>
            <span className={styles.title}>Swap</span>
            <IconWithTooltip title='Settings' placement='left'>
                <div
                    className={`${styles.settings_container}
                    ${styles.settings_icon}`}
                    onClick={openModal}
                    style={{ cursor: 'pointer' }}
                    id='swap_settings_button'
                >
                    <img src={settingsIcon} alt='settings' />
                </div>
            </IconWithTooltip>
        </ContentHeader>
    );

    return (
        <>
            {isOnTradeRoute ? tradeRouteHeader : mainHeader}
            {settingsModalOrNull}
        </>
    );
}
