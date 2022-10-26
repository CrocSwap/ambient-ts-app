// import { Dispatch, SetStateAction } from 'react';
import styles from './SlippageTolerance.module.css';

interface TransactionSettingsPropsIF {
    slippageValue: string;
    setSlippageLocalState: (input: string) => void;
    module: string;
    // setNewSlippage: Dispatch<SetStateAction<string>>;
    handleKeyDown: (event: { keyCode: number }) => void;
}

export default function SlippageTolerance(props: TransactionSettingsPropsIF) {
    const { slippageValue, setSlippageLocalState, module, handleKeyDown } = props;

    const preset1 = module === 'Range Order' ? '1' : '0.1';
    const preset2 = module === 'Range Order' ? '2' : '0.3';
    const preset3 = module === 'Range Order' ? '3' : '0.5';

    return (
        <div className={styles.slippage_tolerance_container}>
            <div className={styles.slippage_title}>Slippage Tolerance (%)</div>
            <div className={styles.slippage_box}>
                <div className={styles.slippage_content}>
                    <div className={styles.input_container}>
                        <input
                            id='slippage_tolerance_input_field'
                            onChange={(e) => {
                                setSlippageLocalState(e.target.value);
                            }}
                            type='text'
                            value={slippageValue}
                            autoComplete={'off'}
                            placeholder={'e.g. 0.3'}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <button onClick={() => setSlippageLocalState(preset1)}>{preset1}%</button>
                    <button onClick={() => setSlippageLocalState(preset2)}>{preset2}%</button>
                    <button onClick={() => setSlippageLocalState(preset3)}>{preset3}%</button>
                    {/* <button onClick={() => setSlippage('0.5')}>0.5%</button>
                    <button onClick={() => setSlippage('1')}>1%</button> */}
                </div>
            </div>
        </div>
    );
}
