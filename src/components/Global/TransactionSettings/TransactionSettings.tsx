// START: Import React and Dongles
import { useState } from 'react';

// START: Import Local Files
import styles from './TransactionSettings.module.css';
import Button from '../Button/Button';
import SlippageTolerance from '../SlippageTolerance/SlippageTolerance';
// import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
// import { setSlippageTolerance } from '../../../utils/state/tradeDataSlice';
import { SlippagePairIF } from '../../../utils/interfaces/exports';

// interface for component props
interface TransactionSettingsPropsIF {
    module: 'Swap' | 'Market Order' | 'Limit Order' | 'Range Order';
    slippage: SlippagePairIF;
    isPairStable: boolean;
    onClose: () => void;
}

export default function TransactionSettings(props: TransactionSettingsPropsIF) {
    const { module, slippage, isPairStable, onClose } = props;

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
            <div className={styles.button_container}>
                {shouldDisplaySlippageTolerance ? (
                    <Button title='Submit' action={handleSubmit} />
                ) : null}
            </div>
        </div>
    );
}
