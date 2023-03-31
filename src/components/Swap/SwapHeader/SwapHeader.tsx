// START: Import React Functional Components
import Modal from '../../../components/Global/Modal/Modal';
import ContentHeader from '../../Global/ContentHeader/ContentHeader';
import TransactionSettings from '../../Global/TransactionSettings/TransactionSettings';
import { useEffect } from 'react';
// START: Import Local Files
import styles from './SwapHeader.module.css';
import { useModal } from '../../../components/Global/Modal/useModal';
import settingsIcon from '../../../assets/images/icons/settings.svg';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';
import { AiOutlineShareAlt } from 'react-icons/ai';
import ShareModal from '../../Global/ShareModal/ShareModal';
import { SlippageMethodsIF } from '../../../App/hooks/useSlippage';
import { allSkipConfirmMethodsIF } from '../../../App/hooks/useSkipConfirm';

// interface for props
interface propsIF {
    swapSlippage: SlippageMethodsIF;
    isPairStable: boolean;
    isOnTradeRoute?: boolean;
    openGlobalModal: (content: React.ReactNode, title?: string) => void;
    bypassConfirm: allSkipConfirmMethodsIF;
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
    } = props;
    const [isModalOpen, openModal, closeModal] = useModal();

    const dispatch = useAppDispatch();

    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase = tradeData.isDenomBase;

    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

    const handleFocuseEnter = (event: KeyboardEvent) => {
        const focusedElement = document.activeElement?.id;
        if (event.key === 'Enter') {
            if (focusedElement === 'swap_share_button') {
                openGlobalModal(<ShareModal />, 'Share');
            } else if (focusedElement === 'swap_settings_button') {
                openModal();
            }
        } else return;
    };

    useEffect(() => {
        document.addEventListener('keydown', handleFocuseEnter, false);
        return () => {
            document.removeEventListener('keydown', handleFocuseEnter, false);
        };
    }, []);

    const tradeRouteHeader = (
        <ContentHeader>
            <button
                onClick={() => openGlobalModal(<ShareModal />, 'Share')}
                className={styles.share_button}
            >
                <AiOutlineShareAlt
                    id='swap_share_button'
                    role='button'
                    tabIndex={0}
                    aria-label='Share button'
                />
            </button>
            <div
                className={styles.token_info}
                onClick={() => dispatch(toggleDidUserFlipDenom())}
            >
                {isDenomBase ? baseTokenSymbol : quoteTokenSymbol} /{' '}
                {isDenomBase ? quoteTokenSymbol : baseTokenSymbol}
            </div>

            <IconWithTooltip title='Settings' placement='left'>
                <div
                    onClick={openModal}
                    style={{ cursor: 'pointer' }}
                    className={`${styles.settings_container} ${styles.settings_icon}`}
                    id='swap_settings_button'
                    role='button'
                    tabIndex={0}
                    aria-label='Settings button'
                >
                    <img src={settingsIcon} alt='settings' />
                </div>
            </IconWithTooltip>
        </ContentHeader>
    );

    const mainHeader = (
        <ContentHeader>
            <button
                onClick={() => openGlobalModal(<ShareModal />, 'Share')}
                className={styles.share_button}
            >
                <AiOutlineShareAlt
                    id='swap_share_button'
                    role='button'
                    tabIndex={0}
                    aria-label='Share button'
                />
            </button>
            <span className={styles.title}>Swap</span>
            <IconWithTooltip title='Settings' placement='left'>
                <div
                    className={`${styles.settings_container}
                    ${styles.settings_icon}`}
                    onClick={openModal}
                    style={{ cursor: 'pointer' }}
                    id='swap_settings_button'
                    role='button'
                    tabIndex={0}
                    aria-label='Open Swap Settings'
                >
                    <img src={settingsIcon} alt='settings' />
                </div>
            </IconWithTooltip>
        </ContentHeader>
    );

    return (
        <>
            {isOnTradeRoute ? tradeRouteHeader : mainHeader}
            {isModalOpen && (
                <Modal
                    noHeader
                    title='modal'
                    onClose={closeModal}
                    centeredTitle
                >
                    <TransactionSettings
                        module={isOnTradeRoute ? 'Market Order' : 'Swap'}
                        slippage={swapSlippage}
                        isPairStable={isPairStable}
                        onClose={closeModal}
                        bypassConfirm={bypassConfirm.swap}
                    />
                </Modal>
            )}
        </>
    );
}
