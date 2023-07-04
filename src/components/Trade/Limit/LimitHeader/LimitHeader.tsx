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
import { useModal } from '../../../../components/Global/Modal/useModal';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
import { memo, useContext } from 'react';
import { UserPreferenceContext } from '../../../../contexts/UserPreferenceContext';
import { AppStateContext } from '../../../../contexts/AppStateContext';

// central react functional component
function LimitHeader() {
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

    const settingsSvg = (
        <svg
            width='14'
            height='14'
            viewBox='0 0 14 14'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className={styles.hoverable_icon}
        >
            <rect
                y='9.625'
                width='8.75'
                height='1.75'
                rx='0.875'
                fill=''
            ></rect>
            <rect
                x='5.25'
                y='2.625'
                width='8.75'
                height='1.75'
                rx='0.875'
                fill=''
            ></rect>
            <circle cx='12.25' cy='10.5' r='1.75' fill=''></circle>
            <circle cx='1.75' cy='3.5' r='1.75' fill=''></circle>
        </svg>
    );

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
                    {settingsSvg}
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
                        onClose={closeModal}
                        bypassConfirm={bypassConfirmLimit}
                    />
                </Modal>
            )}
        </ContentHeader>
    );
}

export default memo(LimitHeader);
