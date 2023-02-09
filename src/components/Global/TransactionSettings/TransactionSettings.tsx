// START: Import React and Dongles
import { useState } from 'react';

// START: Import Local Files
import styles from './TransactionSettings.module.css';
import Button from '../Button/Button';
import SlippageTolerance from '../SlippageTolerance/SlippageTolerance';
// import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
// import { setSlippageTolerance } from '../../../utils/state/tradeDataSlice';
import { SlippagePairIF } from '../../../utils/interfaces/exports';
import ConfirmationModalControl from '../ConfirmationModalControl/ConfirmationModalControl';

// interface for component props
interface propsIF {
    module: 'Swap' | 'Market Order' | 'Limit Order' | 'Range Order';
    slippage: SlippagePairIF;
    isPairStable: boolean;
    onClose: () => void;
    bypassConfirm: boolean;
    toggleBypassConfirm: (item: string, pref: boolean) => void;
}

export default function TransactionSettings(props: propsIF) {
    const { module, slippage, isPairStable, onClose, bypassConfirm, toggleBypassConfirm } = props;

    // const dispatch = useAppDispatch();

    const [newSlippage, setNewSlippage] = useState<string>(
        isPairStable ? slippage.stable.value : slippage.volatile.value,
    );

    const setSlippageLocalState = (input: string) => {
        setNewSlippage(input);
    };

    const setSlippageLocalStorage = (saveInput: string) => {
        isPairStable ? slippage.stable.setValue(saveInput) : slippage.volatile.setValue(saveInput);
    };

    const handleSubmit = () => {
        // dispatch(setSlippageTolerance(parseInt(newSlippage)));
        // isPairStable
        //     ? slippage.stable.setValue(newSlippage)
        //     : slippage.volatile.setValue(newSlippage);
        setSlippageLocalStorage(newSlippage);
        onClose();
    };

    const handleKeyDown = (event: { keyCode: number }) => {
        if (event.keyCode === 13) {
            handleSubmit();
        }
    };

    const toggleFor =
        module === 'Swap' || module === 'Market Order'
            ? 'swap'
            : module === 'Limit Order'
            ? 'limit'
            : 'range';

    const shouldDisplaySlippageTolerance = module !== 'Limit Order';

    return (
        <div className={styles.settings_container}>
            <div className={styles.settings_title}>{module + ' Settings'}</div>
            {shouldDisplaySlippageTolerance ? (
                <SlippageTolerance
                    slippageValue={newSlippage}
                    setSlippageLocalState={setSlippageLocalState}
                    module={module}
                    handleKeyDown={handleKeyDown}
                />
            ) : null}

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
