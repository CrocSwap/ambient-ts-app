// START: Import React and Dongles
import { AiOutlineShareAlt } from 'react-icons/ai';

// START: Import JSX Components
import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
import TransactionSettings from '../../../Global/TransactionSettings/TransactionSettings';
import ShareModal from '../../../Global/ShareModal/ShareModal';
import Modal from '../../../../components/Global/Modal/Modal';
import IconWithTooltip from '../../../Global/IconWithTooltip/IconWithTooltip';

// START: Import Other Local Files
import styles from './LimitHeader.module.css';
import settingsIcon from '../../../../assets/images/icons/settings.svg';
import { useModal } from '../../../../components/Global/Modal/useModal';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
import { memo, useContext } from 'react';
import { UserPreferenceContext } from '../../../../contexts/UserPreferenceContext';
import { AppStateContext } from '../../../../contexts/AppStateContext';

// interface for component props
interface propsIF {
    isPairStable: boolean;
}

// central react functional component
function LimitHeader(props: propsIF) {
    const { isPairStable } = props;
    const { mintSlippage, bypassConfirmLimit } = useContext(
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

    return (
        <ContentHeader>
            <AiOutlineShareAlt
                className={styles.share_button}
                onClick={() => openGlobalModal(<ShareModal />, 'Share')}
                id='limit_share_button'
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
                    className={styles.settings_icon}
                    id='limit_settings_button'
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
                        module='Limit Order'
                        slippage={mintSlippage}
                        isPairStable={isPairStable}
                        onClose={closeModal}
                        bypassConfirm={bypassConfirmLimit}
                    />
                </Modal>
            )}
        </ContentHeader>
    );
}

export default memo(LimitHeader);
