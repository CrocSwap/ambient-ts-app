import styles from './TransactionSettings.module.css';
import Button from '../Button/Button';
import SlippageTolerance from '../SlippageTolerance/SlippageTolerance';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { useState } from 'react';
import { setSlippageTolerance } from '../../../utils/state/tradeDataSlice';
import { SlippagePairIF, TokenPairIF } from '../../../utils/interfaces/exports';
import { checkIsStable } from '../../../utils/data/stablePairs';

interface TransactionSettingsPropsIF {
    chainId: string;
    module: 'Swap' | 'Market Order' | 'Limit Order' | 'Range Order';
    tokenPair: TokenPairIF;
    slippage: SlippagePairIF;
    onClose: () => void;
}

export default function TransactionSettings(props: TransactionSettingsPropsIF) {
    const { chainId, module, tokenPair, slippage, onClose } = props;

    const dispatch = useAppDispatch();

    const isPairStable = checkIsStable(
        tokenPair.dataTokenA.address,
        tokenPair.dataTokenB.address,
        chainId
    );

    console.log({isPairStable});

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
            <div className={styles.button_container}>
                {shouldDisplaySlippageTolerance ? (
                    <Button title='Submit' action={handleClose} />
                ) : null}
            </div>
        </div>
    );
}
