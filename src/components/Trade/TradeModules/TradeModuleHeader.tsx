import React, { memo, useContext } from 'react';
import { AiOutlineShareAlt } from 'react-icons/ai';
import { TransactionModuleType } from '../../Global/TransactionSettings/TransactionSettings';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';

import { SlippageMethodsIF } from '../../../App/hooks/useSlippage';
import { skipConfirmIF } from '../../../App/hooks/useSkipConfirm';
import { TradeModuleHeaderContainer } from '../../../styled/Components/TradeModules';
import { Text } from '../../../styled/Common';
import { SettingsSvg } from '../../../assets/images/icons/settingsSvg';
import { BiArrowBack } from 'react-icons/bi';
import { TradeDataContext } from '../../../contexts/TradeDataContext';

interface propsIF {
    slippage: SlippageMethodsIF;
    bypassConfirm: skipConfirmIF;
    settingsTitle: TransactionModuleType;
    isSwapPage?: boolean;
    activeContent?: string;
    handleSetActiveContent: (newActiveContent: string) => void;
    handleReset: () => void;
    setShowStepperComponent: React.Dispatch<React.SetStateAction<boolean>>;
    showStepperComponent: boolean;
}

function TradeModuleHeader(props: propsIF) {
    const {
        settingsTitle,
        isSwapPage,
        activeContent,
        handleSetActiveContent,
        handleReset,
        setShowStepperComponent,
        showStepperComponent,
    } = props;

    const {
        baseToken,
        quoteToken,
        isDenomBase,
        toggleDidUserFlipDenom,
        deactivateConfirmation,
    } = useContext(TradeDataContext);

    const baseTokenSymbol = baseToken.symbol;
    const quoteTokenSymbol = quoteToken.symbol;

    // TODO:    refactor this file to have only a single top-level return and remove
    // TODO:    ... the `<div>` wrapper around the `TradeModuleHeaderContainer` element

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

    const handleGoBack = () => {
        handleSetActiveContent('main');
        deactivateConfirmation();

        handleReset();
        setShowStepperComponent(false);
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
                            onClick={handleGoBack}
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
                        cursor={
                            activeContent === 'main' ? 'pointer' : 'default'
                        }
                        onClick={
                            activeContent === 'main'
                                ? () => toggleDidUserFlipDenom()
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
                                onClick={() =>
                                    handleSetActiveContent('settings')
                                }
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
        </>
    );
}

export default memo(TradeModuleHeader);
