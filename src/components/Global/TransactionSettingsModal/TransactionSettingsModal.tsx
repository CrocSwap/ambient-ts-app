import { useState, KeyboardEvent, useContext } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import { skipConfirmIF } from '../../../App/hooks/useSkipConfirm';
import { SlippageMethodsIF } from '../../../App/hooks/useSlippage';
import { FlexContainer, Text } from '../../../styled/Common';
import { SettingsContainer } from '../../../styled/Components/TradeModules';
import { isStablePair } from '../../../ambient-utils/dataLayer';
import Button from '../../Form/Button';
import ConfirmationModalControl from '../ConfirmationModalControl/ConfirmationModalControl';
import Modal from '../Modal/Modal';
import SlippageTolerance from '../SlippageTolerance/SlippageTolerance';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import SendToDexBalControl from '../SendToDexBalControl/SendToDexBalControl';
import { dexBalanceMethodsIF } from '../../../App/hooks/useExchangePrefs';

export type TransactionModuleType =
    | 'Swap'
    | 'Limit Order'
    | 'Pool'
    | 'Reposition';

// interface for component props
interface propsIF {
    module: TransactionModuleType;
    slippage: SlippageMethodsIF;
    dexBalSwap?: dexBalanceMethodsIF;
    bypassConfirm: skipConfirmIF;
    onClose: () => void;
}

export default function TransactionSettingsModal(props: propsIF) {
    const { module, slippage, dexBalSwap, onClose, bypassConfirm } = props;
    const { tokenA, tokenB } = useContext(TradeDataContext);

    const isPairStable = isStablePair(tokenA.address, tokenB.address);

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
        event.code === 'Enter' && updateSettings();
    };

    const persistedSlippage: number = isPairStable
        ? slippage.stable
        : slippage.volatile;

    const persistedSaveSwapToDexBal: boolean = dexBalSwap
        ? dexBalSwap.outputToDexBal.isEnabled
        : false;

    const [currentSlippage, setCurrentSlippage] =
        useState<number>(persistedSlippage);

    const [currentSaveSwapToDexBal, setCurrentSaveSwapToDexBal] =
        useState<boolean>(persistedSaveSwapToDexBal);

    const [currentSkipConfirm, setCurrentSkipConfirm] = useState<boolean>(
        bypassConfirm.isEnabled,
    );

    const updateSettings = (): void => {
        isPairStable
            ? slippage.updateStable(currentSlippage)
            : slippage.updateVolatile(currentSlippage);
        bypassConfirm.setValue(currentSkipConfirm);
        dexBalSwap
            ? currentSaveSwapToDexBal
                ? dexBalSwap.outputToDexBal.enable()
                : dexBalSwap.outputToDexBal.disable()
            : undefined;
        onClose();
    };

    const confirmAriaLabel = `Confirm slippage tolerance of ${currentSlippage}% and ${
        currentSkipConfirm ? 'skip' : 'dont skip'
    } ${module} confirmation modal`;

    return (
        <Modal title={`${module} Settings`} onClose={onClose}>
            <SettingsContainer
                flexDirection='column'
                justifyContent='space-between'
                gap={12}
                padding='16px'
            >
                <section>
                    {module !== 'Limit Order' && (
                        <SlippageTolerance
                            persistedSlippage={persistedSlippage}
                            setCurrentSlippage={setCurrentSlippage}
                            handleKeyDown={handleKeyDown}
                            presets={
                                isPairStable
                                    ? slippage.presets.stable
                                    : slippage.presets.volatile
                            }
                        />
                    )}
                    {module === 'Swap' && currentSlippage > 1 && (
                        <FlexContainer
                            alignItems='center'
                            padding='12px 8px 0 8px'
                            color='accent2'
                            fullWidth
                        >
                            <FiAlertTriangle size={28} color='var(--accent2)' />
                            <div style={{ flex: 1, paddingLeft: '8px' }}>
                                <Text
                                    fontSize='body'
                                    style={{
                                        minWidth: '100%',
                                        maxWidth: 'min-content',
                                    }}
                                >
                                    Your transaction may be frontrun and result
                                    in an unfavorable trade
                                </Text>
                            </div>
                        </FlexContainer>
                    )}
                    {module === 'Swap' && (
                        <SendToDexBalControl
                            tempSaveToDex={currentSaveSwapToDexBal}
                            setTempSaveToDex={setCurrentSaveSwapToDexBal}
                            displayInSettings={true}
                        />
                    )}

                    <ConfirmationModalControl
                        tempBypassConfirm={currentSkipConfirm}
                        setTempBypassConfirm={setCurrentSkipConfirm}
                        displayInSettings={true}
                    />
                </section>
                <div style={{ padding: '0 16px' }}>
                    <Button
                        idForDOM='update_settings_button'
                        title={
                            module === 'Limit Order'
                                ? 'Submit Settings'
                                : currentSlippage > 0
                                ? 'Submit'
                                : 'Enter a Valid Slippage'
                        }
                        action={updateSettings}
                        disabled={
                            (module !== 'Limit Order' &&
                                currentSlippage <= 0) ||
                            isNaN(currentSlippage)
                        }
                        flat
                        customAriaLabel={confirmAriaLabel}
                    />
                </div>
            </SettingsContainer>
        </Modal>
    );
}
