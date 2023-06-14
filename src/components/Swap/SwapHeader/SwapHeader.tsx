// START: Import React Functional Components
import Modal from '../../../components/Global/Modal/Modal';
import ContentHeader from '../../Global/ContentHeader/ContentHeader';
import TransactionSettings from '../../Global/TransactionSettings/TransactionSettings';
import { useContext, useEffect } from 'react';
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
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
import { AppStateContext } from '../../../contexts/AppStateContext';

// interface for props
interface propsIF {
    isOnTradeRoute?: boolean;
}

// main react functional component
export default function SwapHeader(props: propsIF) {
    const { isOnTradeRoute } = props;
    const { swapSlippage, bypassConfirmSwap } = useContext(
        UserPreferenceContext,
    );
    const {
        globalModal: { open: openGlobalModal },
    } = useContext(AppStateContext);
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
            <AiOutlineShareAlt
                onClick={() => openGlobalModal(<ShareModal />, 'Share')}
                id='swap_share_button'
                role='button'
                tabIndex={0}
                aria-label='Share button'
            />

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
                className={styles.share_button}
                onClick={() => openGlobalModal(<ShareModal />, 'Share')}
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
                        module={'Swap'}
                        slippage={swapSlippage}
                        onClose={closeModal}
                        bypassConfirm={bypassConfirmSwap}
                    />
                </Modal>
            )}
        </>
    );
}
