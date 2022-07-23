import styles from './TransactionSettings.module.css';
import Button from '../Button/Button';
import SlippageTolerance from '../SlippageTolerance/SlippageTolerance';
import { useAppDispatch, useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { useState } from 'react';
import { setSlippageTolerance } from '../../../utils/state/tradeDataSlice';

interface TransactionSettingsProps {
    module: 'Swap' | 'Market Order' | 'Limit Order' | 'Range Order';
    onClose: () => void;
}

export default function TransactionSettings(props: TransactionSettingsProps) {
    const dispatch = useAppDispatch();

    const tradeData = useAppSelector((state) => state.tradeData);

    const slippageToleranceInRTK = tradeData.slippageTolerance;

    const [slippageInput, setSlippageInput] = useState(slippageToleranceInRTK);

    const handleClose = () => {
        props.onClose();
        dispatch(setSlippageTolerance(slippageInput));
    };

    const shouldDisplaySlippageTolerance = props.module !== 'Limit Order';

    return (
        <div className={styles.settings_container}>
            <div className={styles.settings_title}>{props.module + ' Settings'}</div>
            {shouldDisplaySlippageTolerance ? (
                <SlippageTolerance
                    setSlippageInput={setSlippageInput}
                    slippageInput={slippageInput}
                />
            ) : null}
            <div className={styles.button_container}>
                {shouldDisplaySlippageTolerance ? (
                    <Button title='Submit' action={handleClose} />
                ) : null}
            </div>
        </div>
    );
}
