// START: Import React and Dongles
import { useState } from 'react';

// START: Import Local Files
import styles from './TransactionSettings.module.css';
import Button from '../Button/Button';
import SlippageTolerance from '../SlippageTolerance/SlippageTolerance';
import ConfirmationModalControl from '../ConfirmationModalControl/ConfirmationModalControl';
import { SlippageMethodsIF } from '../../../App/hooks/useSlippage';
import { skipConfirmIF } from '../../../App/hooks/useSkipConfirm';
import { VscClose } from 'react-icons/vsc';

// interface for component props
interface propsIF {
    module:
        | 'Swap'
        | 'Market Order'
        | 'Limit Order'
        | 'Range Order'
        | 'Reposition';
    toggleFor: string;
    slippage: SlippageMethodsIF;
    isPairStable: boolean;
    onClose: () => void;
    bypassConfirm: skipConfirmIF;
}

export default function TransactionSettings(props: propsIF) {
    const {
        module,
        toggleFor,
        slippage,
        isPairStable,
        onClose,
        bypassConfirm,
    } = props;

    const handleKeyDown = (event: { keyCode: number }): void => {
        event.keyCode === 13 && updateSettings();
    };

    const shouldDisplaySlippageTolerance = module !== 'Limit Order';

    const persistedSlippage = isPairStable
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

    return (
        <>
            <div className={styles.settings_title}>
                <div />
                {module + ' Settings'}

                <span onClick={onClose}>
                    {' '}
                    <VscClose size={22} />
                </span>
            </div>
            <div className={styles.settings_container}>
                <section>
                    {shouldDisplaySlippageTolerance && (
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
                        toggleFor={toggleFor}
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
                        />
                    ) : (
                        <Button
                            title='Confirm Settings'
                            action={updateSettings}
                            flat
                        />
                    )}
                </div>
            </div>
        </>
    );
}
