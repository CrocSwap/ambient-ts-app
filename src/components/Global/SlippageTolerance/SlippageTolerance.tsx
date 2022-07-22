import { Dispatch, SetStateAction } from 'react';
import styles from './SlippageTolerance.module.css';

interface TransactionSettingsPropsIF {
    slippageValue: string;
    setNewSlippage: Dispatch<SetStateAction<string>>;
}

export default function SlippageTolerance(props: TransactionSettingsPropsIF) {
    const { slippageValue, setNewSlippage } = props;

    console.log({slippageValue});

    return (
        <div className={styles.slippage_tolerance_container}>
            <div className={styles.slippage_title}>Slippage Tolerance (%)</div>
            <div className={styles.slippage_box}>
                <div className={styles.slippage_content}>
                    <div className={styles.input_container}>
                        <input
                            id='slippage_tolerance_input_field'
                            onChange={(e) => setNewSlippage(e.target.value)}
                            type='text'
                            defaultValue={slippageValue.toString()}
                            placeholder={'slippage'}
                        />
                    </div>
                    <button onClick={() => setNewSlippage('0.1')}>0.1%</button>
                    <button onClick={() => setNewSlippage('0.5')}>0.5%</button>
                    <button onClick={() => setNewSlippage('1')}>1%</button>
                </div>
            </div>
        </div>
    );
}
