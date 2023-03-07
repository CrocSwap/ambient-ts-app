// START: Import React and Dongles

// START: Import React Functional Components
import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
import TransactionSettings from '../../../Global/TransactionSettings/TransactionSettings';

// START: Import Local Files
import styles from './LimitHeader.module.css';
import settingsIcon from '../../../../assets/images/icons/settings.svg';
import Modal from '../../../../components/Global/Modal/Modal';
import { useModal } from '../../../../components/Global/Modal/useModal';
import { useAppDispatch, useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
import IconWithTooltip from '../../../Global/IconWithTooltip/IconWithTooltip';
import { AiOutlineShareAlt } from 'react-icons/ai';
import ShareModal from '../../../Global/ShareModal/ShareModal';
import { SlippageMethodsIF } from '../../../../App/hooks/useSlippage';

// interface for component props
interface propsIF {
    chainId: string;
    mintSlippage: SlippageMethodsIF;
    isPairStable: boolean;
    bypassConfirm: boolean;
    toggleBypassConfirm: (item: string, pref: boolean) => void;
    openGlobalModal: (content: React.ReactNode, title?: string) => void;
    shareOptionsDisplay: JSX.Element;
}

// central react functional component
export default function LimitHeader(props: propsIF) {
    const { mintSlippage, isPairStable, openGlobalModal, bypassConfirm, toggleBypassConfirm } =
        props;

    const [isModalOpen, openModal, closeModal] = useModal();

    const dispatch = useAppDispatch();
    const tradeData = useAppSelector((state) => state.tradeData);
    const isDenomBase = tradeData.isDenomBase;
    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

    const settingsModalOrNull = isModalOpen ? (
        <Modal noHeader title='modal' onClose={closeModal}>
            <TransactionSettings
                module='Limit Order'
                toggleFor='limit'
                slippage={mintSlippage}
                isPairStable={isPairStable}
                onClose={closeModal}
                bypassConfirm={bypassConfirm}
                toggleBypassConfirm={toggleBypassConfirm}
            />
        </Modal>
    ) : null;

    return (
        <ContentHeader>
            <div
                className={styles.share_button}
                onClick={() => openGlobalModal(<ShareModal />, 'Share')}
                id='limit_share_button'
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
                    className={styles.settings_icon}
                    id='limit_settings_button'
                >
                    <img src={settingsIcon} alt='settings' />
                </div>
            </IconWithTooltip>
            {settingsModalOrNull}
        </ContentHeader>
    );
}
