import { useContext, useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import { skipConfirmIF } from '../../../../../App/hooks/useSkipConfirm';
import { SlippageMethodsIF } from '../../../../../App/hooks/useSlippage';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { isStablePair } from '../../../../../utils/data/stablePairs';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import Button from '../../../../Global/Button/Button';
import ConfirmationModalControl from '../../../../Global/ConfirmationModalControl/ConfirmationModalControl';
import Modal from '../../../../Global/Modal/Modal';
import SlippageTolerance from '../../../../Global/SlippageTolerance/SlippageTolerance';
import styles from './TransactionSettings.module.css';

export type TransactionModuleType =
    | 'Swap'
    | 'Limit Order'
    | 'Pool'
    | 'Reposition';
interface propsIF {
    module: TransactionModuleType;
    slippage: SlippageMethodsIF;
    bypassConfirm: skipConfirmIF;
    onClose: () => void;
    isOpen: boolean;
}

export default function TransactionSettingsModal(props: propsIF) {
    const { module, slippage, onClose, bypassConfirm, isOpen } = props;
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
        <Modal title={`${module} Settings`} onClose={onClose}>
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
                    {module === 'Swap' && currentSlippage > 1 && (
                        <div className={styles.frontrun_warning}>
                            <FiAlertTriangle size={28} color='var(--accent2)' />
                            <div>
                                <p>
                                    Your transaction may be frontrun and result
                                    in an unfavorable trade
                                </p>
                            </div>
                        </div>
                    )}
                    <ConfirmationModalControl
                        tempBypassConfirm={currentSkipConfirm}
                        setTempBypassConfirm={setCurrentSkipConfirm}
                        displayInSettings={true}
                    />
                </section>
                <div className={styles.button_container}>
                    <Button
                        title={
                            module === 'Limit Order'
                                ? 'Submit Settings'
                                : currentSlippage > 0
                                ? 'Submit'
                                : 'Enter a Valid Slippage'
                        }
                        action={updateSettings}
                        disabled={
                            module !== 'Limit Order' && currentSlippage <= 0
                        }
                        flat
                        customAriaLabel={confirmAriaLabel}
                    />
                </div>
            </div>
        </Modal>
    );
}
