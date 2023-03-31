// START: Import React and Dongles
import { useState } from 'react';

// START: Import JSX Components
import Button from '../Button/Button';
import SlippageTolerance from '../SlippageTolerance/SlippageTolerance';
import ConfirmationModalControl from '../ConfirmationModalControl/ConfirmationModalControl';

// START: Import Local Files
import styles from './TransactionSettings.module.css';
import { SlippageMethodsIF } from '../../../App/hooks/useSlippage';
import { VscClose } from 'react-icons/vsc';
import { skipConfirmIF } from '../../../App/hooks/useSkipConfirm';

// interface for component props
interface propsIF {
    module:
        | 'Swap'
        | 'Market Order'
        | 'Limit Order'
        | 'Range Order'
        | 'Reposition';
    slippage: SlippageMethodsIF;
    isPairStable: boolean;
    onClose: () => void;
    bypassConfirm: skipConfirmIF;
}

export default function TransactionSettings(props: propsIF) {
    const { module, slippage, isPairStable, onClose, bypassConfirm } = props;

    const handleKeyDown = (event: { keyCode: number }): void => {
        event.keyCode === 13 && updateSettings();
    };

    const persistedSlippage: number = isPairStable
        ? slippage.stable
        : slippage.volatile;

    const [currentSlippage, setCurrentSlippage] =
        useState<number>(persistedSlippage);

    const [currentSkipConfirm, setCurrentSkipConfirm] = useState<boolean>(
        bypassConfirm.isEnabled,
    );

    const updateSettings = (): void => {
        isPairStable
            ? slippage.updateStable(currentSlippage)
            : slippage.updateVolatile(currentSlippage);
        bypassConfirm.setValue(currentSkipConfirm);
        onClose();
    };

    const confirmAriaLabel = `Confirm slippage tolerance of ${currentSlippage}% and ${
        currentSkipConfirm ? 'skip' : 'dont skip'
    } ${module} confirmation modal`;

    return (
        // <FocusTrap>
        <section>
            <div className={styles.settings_title}>
                <div />
                {module + ' Settings'}
                <button onClick={onClose} className={styles.close_button}>
                    {' '}
                    <VscClose size={22} />
                </button>
            </div>
            <div className={styles.settings_container}>
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
                    <ConfirmationModalControl
                        tempBypassConfirm={currentSkipConfirm}
                        setTempBypassConfirm={setCurrentSkipConfirm}
                        displayInSettings={true}
                    />
                </section>
                <div className={styles.button_container}>
                    {module !== 'Limit Order' ? (
                        <Button
                            title={
                                currentSlippage > 0
                                    ? 'Confirm'
                                    : 'Enter a Valid Slippage'
                            }
                            action={updateSettings}
                            disabled={!(currentSlippage > 0)}
                            flat
                            customAriaLabel={confirmAriaLabel}
                        />
                    ) : (
                        <Button
                            title='Confirm Settings'
                            action={updateSettings}
                            flat
                            customAriaLabel={confirmAriaLabel}
                        />
                    )}
                </div>
            </div>
        </section>
        // </FocusTrap>
    );
}
