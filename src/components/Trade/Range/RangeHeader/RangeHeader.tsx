// START: Import React and Dongles
import { memo, useContext } from 'react';

// START: Import JSX Components
import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
import TransactionSettings from '../../../Global/TransactionSettings/TransactionSettings';

// START: Import Local Files
import styles from './RangeHeader.module.css';
import settingsIcon from '../../../../assets/images/icons/settings.svg';
import Modal from '../../../../components/Global/Modal/Modal';
import { useModal } from '../../../../components/Global/Modal/useModal';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
import IconWithTooltip from '../../../Global/IconWithTooltip/IconWithTooltip';
import { AiOutlineShareAlt } from 'react-icons/ai';
import ShareModal from '../../../Global/ShareModal/ShareModal';
import { SlippageMethodsIF } from '../../../../App/hooks/useSlippage';
import { UserPreferenceContext } from '../../../../contexts/UserPreferenceContext';
import { AppStateContext } from '../../../../contexts/AppStateContext';

// interface for component props
interface propsIF {
    mintSlippage: SlippageMethodsIF;
    isPairStable: boolean;
    isTokenABase: boolean;
}

// central react functional component
function RangeHeader(props: propsIF) {
    const { mintSlippage, isPairStable, isTokenABase } = props;

    const { bypassConfirmRange } = useContext(UserPreferenceContext);
    const {
        globalModal: { open: openGlobalModal },
    } = useContext(AppStateContext);
    const { isDenomBase, tokenA, tokenB } = useAppSelector(
        (state) => state.tradeData,
    );

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
                {reverseDisplay ? tokenA.symbol : tokenB.symbol} /{' '}
                {reverseDisplay ? tokenB.symbol : tokenA.symbol}
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
                        module='Pool'
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
