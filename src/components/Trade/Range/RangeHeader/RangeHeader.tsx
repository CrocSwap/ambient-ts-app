// START: Import React and Dongles
import { memo, useContext } from 'react';

// START: Import JSX Components
import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
import TransactionSettings from '../../../Global/TransactionSettings/TransactionSettings';

// START: Import Local Files
import styles from './RangeHeader.module.css';
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
    isTokenABase: boolean;
}

// central react functional component
function RangeHeader(props: propsIF) {
    const { mintSlippage, isTokenABase } = props;

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

    const settinsSvg = (
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
                    {settinsSvg}
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
                        onClose={closeModal}
                        bypassConfirm={bypassConfirmRange}
                    />
                </Modal>
            )}
        </ContentHeader>
    );
}

export default memo(RangeHeader);
