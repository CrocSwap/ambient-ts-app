// START: Import React and Dongles
import { useState } from 'react';

// START: Import Local Files
import styles from './TransactionSettings.module.css';
import Button from '../Button/Button';
import SlippageTolerance from '../SlippageTolerance/SlippageTolerance';
import ConfirmationModalControl from '../ConfirmationModalControl/ConfirmationModalControl';
import DividerDark from '../DividerDark/DividerDark';
import { SlippageMethodsIF } from '../../../App/hooks/useSlippage';

// interface for component props
interface propsIF {
    module: 'Swap' | 'Market Order' | 'Limit Order' | 'Range Order' | 'Reposition';
    toggleFor: string;
    slippage: SlippageMethodsIF;
    isPairStable: boolean;
    onClose: () => void;
    bypassConfirm: boolean;
    toggleBypassConfirm: (item: string, pref: boolean) => void;
}

export default function TransactionSettings(props: propsIF) {
    const {
        module,
        toggleFor,
        slippage,
        isPairStable,
        onClose,
        bypassConfirm,
        toggleBypassConfirm,
    } = props;

    const [newSlippage, setNewSlippage] = useState<string>(
        isPairStable ? slippage.stable.toString() : slippage.volatile.toString(),
    );

    const handleSubmit = (): void => {
        const slippageAsFloat = parseFloat(newSlippage);
        isPairStable
            ? slippage.updateStable(slippageAsFloat)
            : slippage.updateVolatile(slippageAsFloat);
        onClose();
    };

    const handleKeyDown = (event: { keyCode: number }): void => {
        event.keyCode === 13 && handleSubmit();
    }

    const shouldDisplaySlippageTolerance = module !== 'Limit Order';

    return (
        <div className={styles.settings_container}>
            <div className={styles.settings_title}>{module + ' Settings'}</div>
            {shouldDisplaySlippageTolerance && (
                <SlippageTolerance
                    slippageValue={newSlippage}
                    setNewSlippage={setNewSlippage}
                    module={module}
                    handleKeyDown={handleKeyDown}
                />
            )}
            <DividerDark />
            <DividerDark />

            <ConfirmationModalControl
                bypassConfirm={bypassConfirm}
                toggleBypassConfirm={toggleBypassConfirm}
                toggleFor={toggleFor}
                displayInSettings={true}
            />

            <div className={styles.button_container}>
                {shouldDisplaySlippageTolerance ? (
                    <Button title='Submit' action={handleSubmit} flat={true} />
                ) : null}
            </div>
        </div>
    );
}
