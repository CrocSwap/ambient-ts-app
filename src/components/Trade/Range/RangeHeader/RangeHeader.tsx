// START: Import React and Dongles
import { memo, useContext } from 'react';

// START: Import JSX Components
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
import { UserPreferenceContext } from '../../../../contexts/UserPreferenceContext';
import { AppStateContext } from '../../../../contexts/AppStateContext';

// interface for component props
interface propsIF {
    chainId: string;
    tokenPair: TokenPairIF;
    mintSlippage: SlippageMethodsIF;
    isPairStable: boolean;
    isDenomBase: boolean;
    isTokenABase: boolean;
    shareOptionsDisplay: JSX.Element;
}

// central react functional component
function RangeHeader(props: propsIF) {
    const { tokenPair, mintSlippage, isPairStable, isDenomBase, isTokenABase } =
        props;

    const { bypassConfirmRange } = useContext(UserPreferenceContext);
    const {
        globalModal: { open: openGlobalModal },
    } = useContext(AppStateContext);

    const [isModalOpen, openModal, closeModal] = useModal();

    const dispatch = useAppDispatch();

    const reverseDisplay =
        (isTokenABase && isDenomBase) || (!isTokenABase && !isDenomBase);

    return (
        <ContentHeader>
            <AiOutlineShareAlt
                onClick={() => openGlobalModal(<ShareModal />, 'Share')}
                id='range_share_button'
                role='button'
                tabIndex={0}
                aria-label='Share button'
            />

            <div
                className={styles.token_info}
                onClick={() => dispatch(toggleDidUserFlipDenom())}
            >
                {reverseDisplay
                    ? tokenPair.dataTokenA.symbol
                    : tokenPair.dataTokenB.symbol}{' '}
                /{' '}
                {reverseDisplay
                    ? tokenPair.dataTokenB.symbol
                    : tokenPair.dataTokenA.symbol}
            </div>
            <IconWithTooltip title='Settings' placement='left'>
                <div
                    onClick={openModal}
                    style={{ cursor: 'pointer' }}
                    className={`${styles.settings_container} ${styles.settings_icon}`}
                    id='range_settings_button'
                    role='button'
                    tabIndex={0}
                    aria-label='Settings button'
                >
                    <img src={settingsIcon} alt='settings' />
                </div>
            </IconWithTooltip>
            {isModalOpen && (
                <Modal
                    noHeader
                    title='modal'
                    onClose={closeModal}
                    centeredTitle
                >
                    <TransactionSettings
                        module='Range Order'
                        slippage={mintSlippage}
                        isPairStable={isPairStable}
                        onClose={closeModal}
                        bypassConfirm={bypassConfirmRange}
                    />
                </Modal>
            )}
        </ContentHeader>
    );
}

export default memo(RangeHeader);
