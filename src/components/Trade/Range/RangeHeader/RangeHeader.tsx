// START: Import React and Dongles
import { ReactNode } from 'react';

// START: Import React Functional Components
import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
import TransactionSettings from '../../../Global/TransactionSettings/TransactionSettings';

// START: Import Local Files
import styles from './RangeHeader.module.css';
import { TokenPairIF } from '../../../../utils/interfaces/exports';
import settingsIcon from '../../../../assets/images/icons/settings.svg';
import Modal from '../../../../components/Global/Modal/Modal';
import { useModal } from '../../../../components/Global/Modal/useModal';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
import IconWithTooltip from '../../../Global/IconWithTooltip/IconWithTooltip';
import { AiOutlineShareAlt } from 'react-icons/ai';
import ShareModal from '../../../Global/ShareModal/ShareModal';
import { SlippageMethodsIF } from '../../../../App/hooks/useSlippage';

// interface for component props
interface propsIF {
    chainId: string;
    tokenPair: TokenPairIF;
    mintSlippage: SlippageMethodsIF;
    isPairStable: boolean;
    isDenomBase: boolean;
    isTokenABase: boolean;
    openGlobalModal: (content: ReactNode, title?: string) => void;
    bypassConfirm: boolean;
    toggleBypassConfirm: (item: string, pref: boolean) => void;
    shareOptionsDisplay: JSX.Element;
}

// central react functional component
export default function RangeHeader(props: propsIF) {
    const {
        tokenPair,
        mintSlippage,
        isPairStable,
        isDenomBase,
        isTokenABase,
        openGlobalModal,
        bypassConfirm,
        toggleBypassConfirm,
    } = props;

    const [isModalOpen, openModal, closeModal] = useModal();

    const dispatch = useAppDispatch();

    const reverseDisplay = (isTokenABase && isDenomBase) || (!isTokenABase && !isDenomBase);

    const settingsModalOrNull = isModalOpen ? (
        <Modal noHeader title='modal' onClose={closeModal}>
            <TransactionSettings
                module='Range Order'
                toggleFor='range'
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
                id='range_share_button'
            >
                <AiOutlineShareAlt />
            </div>
            <div className={styles.token_info} onClick={() => dispatch(toggleDidUserFlipDenom())}>
                {reverseDisplay ? tokenPair.dataTokenA.symbol : tokenPair.dataTokenB.symbol} /{' '}
                {reverseDisplay ? tokenPair.dataTokenB.symbol : tokenPair.dataTokenA.symbol}
            </div>
            <IconWithTooltip title='Settings' placement='left'>
                <div
                    onClick={openModal}
                    style={{ cursor: 'pointer' }}
                    className={`${styles.settings_container} ${styles.settings_icon}`}
                    id='range_settings_button'
                >
                    <img src={settingsIcon} alt='settings' />
                </div>
            </IconWithTooltip>
            {settingsModalOrNull}
        </ContentHeader>
    );
}
