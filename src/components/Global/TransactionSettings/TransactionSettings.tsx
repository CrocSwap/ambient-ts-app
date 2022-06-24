import styles from './TransactionSettings.module.css';

import SlippageTolerance from '../SlippageTolerance/SlippageTolerance';

import { useAppDispatch, useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { useState } from 'react';
import { setSlippageTolerance } from '../../../utils/state/tradeDataSlice';

interface TransactionSettingsProps {
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

    return (
        <div className={styles.settings_container}>
            <div className={styles.settings_title}>Settings</div>
            <SlippageTolerance setSlippageInput={setSlippageInput} />
            <button onClick={handleClose}>Submit</button>
        </div>
    );
}
