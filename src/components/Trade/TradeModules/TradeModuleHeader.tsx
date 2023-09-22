import { memo } from 'react';
import { AiOutlineShareAlt } from 'react-icons/ai';
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
import {
    HoverableIcon,
    TradeModuleHeaderContainer,
} from '../../../styled/Components/TradeModules';
import { Text } from '../../../styled/Common';

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
        <HoverableIcon
            width='14'
            height='14'
            viewBox='0 0 14 14'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
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
        </HoverableIcon>
    );

    return (
        <>
            <div style={{ paddingBottom: isSwapPage ? '16px' : '' }}>
                <TradeModuleHeaderContainer
                    flexDirection='row'
                    alignItems='center'
                    justifyContent='space-between'
                    fullWidth
                    fontSize='header1'
                    color='text2'
                >
                    <AiOutlineShareAlt
                        onClick={openShareModal}
                        id='share_button'
                        role='button'
                        tabIndex={0}
                        aria-label='Share button'
                    />

                    {isSwapPage ? (
                        <Text color='text1'>Swap</Text>
                    ) : (
                        <Text
                            color='text1'
                            fontSize='header1'
                            role='button'
                            onClick={() => dispatch(toggleDidUserFlipDenom())}
                        >
                            {isDenomBase ? baseTokenSymbol : quoteTokenSymbol} /{' '}
                            {isDenomBase ? quoteTokenSymbol : baseTokenSymbol}
                        </Text>
                    )}
                    <IconWithTooltip title='Settings' placement='left'>
                        <div
                            onClick={openSettingsModal}
                            id='settings_button'
                            role='button'
                            tabIndex={0}
                            aria-label='Settings button'
                        >
                            {settingsSvg}
                        </div>
                    </IconWithTooltip>
                </TradeModuleHeaderContainer>
            </div>
            {isSettingsModalOpen && (
                <TransactionSettingsModal
                    module={settingsTitle}
                    slippage={slippage}
                    bypassConfirm={bypassConfirm}
                    onClose={closeSettingsModal}
                />
            )}
            {isShareModalOpen && <ShareModal onClose={closeShareModal} />}
        </>
    );
}

export default memo(TradeModuleHeader);
