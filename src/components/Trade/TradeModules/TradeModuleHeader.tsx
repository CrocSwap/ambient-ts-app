import { memo } from 'react';
import { AiOutlineShareAlt } from 'react-icons/ai';
import ContentHeader from '../../Global/ContentHeader/ContentHeader';
import TransactionSettingsModal, {
    TransactionModuleType,
} from '../../Global/TransactionSettingsModal/TransactionSettingsModal';
import ShareModal from '../../Global/ShareModal/ShareModal';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
import { SlippageMethodsIF } from '../../../App/hooks/useSlippage';
import { skipConfirmIF } from '../../../App/hooks/useSkipConfirm';
import { useModal } from '../../Global/Modal/useModal';
import styles from './TradeModuleHeader.module.css';

interface propsIF {
    slippage: SlippageMethodsIF;
    bypassConfirm: skipConfirmIF;
    settingsTitle: TransactionModuleType;
    isSwapPage?: boolean;
}

function TradeModuleHeader(props: propsIF) {
    const { slippage, bypassConfirm, settingsTitle, isSwapPage } = props;

    const [isSettingsModalOpen, openSettingsModal, closeSettingsModal] =
        useModal();

    const [isShareModalOpen, openShareModal, closeShareModal] = useModal();

    const dispatch = useAppDispatch();

    const tradeData = useAppSelector((state) => state.tradeData);
    const isDenomBase = tradeData.isDenomBase;
    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

    // TODO: refactor this into its own file
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
        <>
            <div className={isSwapPage ? styles.swap_page_header : ''}>
                <ContentHeader>
                    <AiOutlineShareAlt
                        className={styles.share_button}
                        onClick={openShareModal}
                        id='share_button'
                        role='button'
                        tabIndex={0}
                        aria-label='Share button'
                    />

                    {isSwapPage ? (
                        <span className={styles.title}>Swap</span>
                    ) : (
                        <div
                            className={styles.token_info}
                            onClick={() => dispatch(toggleDidUserFlipDenom())}
                        >
                            {isDenomBase ? baseTokenSymbol : quoteTokenSymbol} /{' '}
                            {isDenomBase ? quoteTokenSymbol : baseTokenSymbol}
                        </div>
                    )}
                    <IconWithTooltip title='Settings' placement='left'>
                        <div
                            onClick={openSettingsModal}
                            style={{ cursor: 'pointer' }}
                            className={`${styles.settings_container}
                            ${styles.settings_icon}`}
                            id='settings_button'
                            role='button'
                            tabIndex={0}
                            aria-label='Settings button'
                        >
                            {settingsSvg}
                        </div>
                    </IconWithTooltip>
                </ContentHeader>
            </div>
            <TransactionSettingsModal
                module={settingsTitle}
                slippage={slippage}
                bypassConfirm={bypassConfirm}
                isOpen={isSettingsModalOpen}
                onClose={closeSettingsModal}
            />
            <ShareModal isOpen={isShareModalOpen} onClose={closeShareModal} />
        </>
    );
}

export default memo(TradeModuleHeader);
