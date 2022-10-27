// START: Import React Functional Components
import Modal from '../../../components/Global/Modal/Modal';
import ContentHeader from '../../Global/ContentHeader/ContentHeader';
import TransactionSettings from '../../Global/TransactionSettings/TransactionSettings';

// START: Import Local Files
import styles from './SwapHeader.module.css';
import { useModal } from '../../../components/Global/Modal/useModal';
import settingsIcon from '../../../assets/images/icons/settings.svg';
import { SlippagePairIF } from '../../../utils/interfaces/exports';
import { useAppDispatch, useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';
import { AiOutlineShareAlt } from 'react-icons/ai';

// interface for props
interface SwapHeaderPropsIF {
    // tokenPair: TokenPairIF;
    swapSlippage: SlippagePairIF;
    isPairStable: boolean;
    isOnTradeRoute?: boolean;
    openGlobalModal: (content: React.ReactNode, title?: string) => void;

    shareOptionsDisplay: JSX.Element;
    // isDenomBase: boolean;
    // isTokenABase: boolean;
}

// main react functional component
export default function SwapHeader(props: SwapHeaderPropsIF) {
    const { swapSlippage, isPairStable, isOnTradeRoute, openGlobalModal } = props;
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
                slippage={swapSlippage}
                isPairStable={isPairStable}
                onClose={closeModal}
            />
        </Modal>
    ) : null;

    const tradeRouteHeader = (
        <ContentHeader>
            <div
                className={styles.share_button}
                onClick={() => openGlobalModal(props.shareOptionsDisplay, 'Share')}
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
                >
                    <img src={settingsIcon} alt='settings' />
                </div>
            </IconWithTooltip>
        </ContentHeader>
    );

    const mainHeader = (
        <ContentHeader>
            <div />
            <span className={styles.title}>Swap</span>
            <IconWithTooltip title='Settings' placement='left'>
                <div
                    className={`${styles.settings_container}
                    ${styles.settings_icon}`}
                    onClick={openModal}
                    style={{ cursor: 'pointer' }}
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
