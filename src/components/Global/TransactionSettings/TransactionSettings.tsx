import styles from './TransactionSettings.module.css';

import SlippageTolerance from '../SlippageTolerance/SlippageTolerance';

import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { useState } from 'react';
import { setSlippageTolerance } from '../../../utils/state/tradeDataSlice';
import { SlippagePairIF } from '../../../utils/interfaces/exports';

interface TransactionSettingsProps {
    module: 'Swap' | 'Market Order' | 'Limit Order' | 'Range Order';
    slippage: SlippagePairIF;
    onClose: () => void;
}

export default function TransactionSettings(props: TransactionSettingsProps) {
    const { module, slippage, onClose } = props;

    console.log(slippage);

    const dispatch = useAppDispatch();

    const isPairStable = false;

    const [newSlippage, setNewSlippage] = useState<string>(isPairStable ? slippage.stable.value : slippage.volatile.value);

    const handleClose = () => {
        dispatch(setSlippageTolerance(parseInt(newSlippage)));
        isPairStable
            ? slippage.stable.setValue(newSlippage)
            : slippage.volatile.setValue(newSlippage);
        onClose();
    };

    const shouldDisplaySlippageTolerance = module !== 'Limit Order';

    return (
        <div className={styles.settings_container}>
            <div className={styles.settings_title}>{module + ' Settings'}</div>
            {shouldDisplaySlippageTolerance ? (
                <SlippageTolerance
                    slippageValue={isPairStable ? slippage.stable.value : slippage.volatile.value}
                    setNewSlippage={setNewSlippage}
                />
            ) : null}
            {shouldDisplaySlippageTolerance ? <button onClick={handleClose}>Submit</button> : null}
        </div>
    );
}
