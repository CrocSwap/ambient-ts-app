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
import { TradeModuleHeaderContainer } from '../../../styled/Components/TradeModules';
import { Text } from '../../../styled/Common';
import { SettingsSvg } from '../../../assets/images/icons/settingsSvg';
import { BiArrowBack } from 'react-icons/bi';

interface propsIF {
    slippage: SlippageMethodsIF;
    bypassConfirm: skipConfirmIF;
    settingsTitle: TransactionModuleType;
    isSwapPage?: boolean;
    activeContent?: string;
    handleSetActiveContent: (newActiveContent: string) => void;
}

function TradeModuleHeader(props: propsIF) {
    const {
        slippage,
        bypassConfirm,
        settingsTitle,
        isSwapPage,
        activeContent,
        handleSetActiveContent,
    } = props;

    const [isSettingsModalOpen, openSettingsModal, closeSettingsModal] =
        useModal();

    const [isShareModalOpen, openShareModal, closeShareModal] = useModal();

    const dispatch = useAppDispatch();

    const tradeData = useAppSelector((state) => state.tradeData);
    const isDenomBase = tradeData.isDenomBase;
    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

    const generateTitle = (
        activeContent: string,
        settingsTitle: string,
        isSwapPage: boolean,
    ) => {
        if (activeContent === 'main') {
            return isSwapPage
                ? 'Swap'
                : (isDenomBase ? baseTokenSymbol : quoteTokenSymbol) +
                      '/' +
                      (isDenomBase ? quoteTokenSymbol : baseTokenSymbol);
        }

        switch (activeContent) {
            case 'confirmation':
                return `${settingsTitle} Confirmation`;
            case 'settings':
                return `${settingsTitle} Settings`;
            case 'share':
                return 'Share';
            default:
                return '';
        }
    };

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
                    {activeContent === 'main' ? (
                        <AiOutlineShareAlt
                            onClick={() => handleSetActiveContent('share')}
                            id='share_button'
                            role='button'
                            tabIndex={0}
                            aria-label='Share button'
                        />
                    ) : (
                        <BiArrowBack
                            onClick={() => handleSetActiveContent('main')}
                            id='back button'
                            role='button'
                            tabIndex={0}
                            aria-label='back button'
                        />
                    )}

                    <Text
                        color='text1'
                        fontSize='header1'
                        role='button'
                        onClick={
                            activeContent === 'main'
                                ? () => dispatch(toggleDidUserFlipDenom())
                                : undefined
                        }
                    >
                        {generateTitle(
                            activeContent ?? 'main',
                            settingsTitle,
                            isSwapPage ?? false,
                        )}
                    </Text>

                    {activeContent === 'main' ? (
                        <IconWithTooltip title='Settings' placement='left'>
                            <div
                                onClick={openSettingsModal}
                                id='settings_button'
                                role='button'
                                tabIndex={0}
                                aria-label='Settings button'
                            >
                                {<SettingsSvg />}
                            </div>
                        </IconWithTooltip>
                    ) : (
                        <p />
                    )}
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
            {/* {isShareModalOpen && <ShareModal onClose={closeShareModal} />} */}
        </>
    );
}

export default memo(TradeModuleHeader);
