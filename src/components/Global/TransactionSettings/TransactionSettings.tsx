// START: Import React and Dongles
import { useContext, useState } from 'react';

// START: Import JSX Components
import Button from '../Button/Button';
import SlippageTolerance from '../SlippageTolerance/SlippageTolerance';
import ConfirmationModalControl from '../ConfirmationModalControl/ConfirmationModalControl';

// START: Import Local Files
import styles from './TransactionSettings.module.css';
import { SlippageMethodsIF } from '../../../App/hooks/useSlippage';
import { VscClose } from 'react-icons/vsc';
import { skipConfirmIF } from '../../../App/hooks/useSkipConfirm';
import { isStablePair } from '../../../utils/data/stablePairs';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';

// interface for component props
interface propsIF {
    module: 'Swap' | 'Limit Order' | 'Pool' | 'Reposition';
    slippage: SlippageMethodsIF;
    onClose: () => void;
    bypassConfirm: skipConfirmIF;
}

export default function TransactionSettings(props: propsIF) {
    const { module, slippage, onClose, bypassConfirm } = props;
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { tokenA, tokenB } = useAppSelector((state) => state.tradeData);

    const isPairStable = isStablePair(tokenA.address, tokenB.address, chainId);

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
