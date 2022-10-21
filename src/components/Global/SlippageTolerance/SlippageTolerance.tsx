// import { Dispatch, SetStateAction } from 'react';
import styles from './SlippageTolerance.module.css';

interface TransactionSettingsPropsIF {
    slippageValue: string;
    setSlippage: (input: string) => void;
    module: string;
    // setNewSlippage: Dispatch<SetStateAction<string>>;
}

export default function SlippageTolerance(props: TransactionSettingsPropsIF) {
    const { slippageValue, setSlippage, module } = props;

    const preset1 = module === 'Range Order' ? '1' : '0.1';
    const preset2 = module === 'Range Order' ? '2' : '0.3';
    const preset3 = module === 'Range Order' ? '3' : '0.5';

    console.log({ slippageValue });

    return (
        <div className={styles.slippage_tolerance_container}>
            <div className={styles.slippage_title}>Slippage Tolerance (%)</div>
            <div className={styles.slippage_box}>
                <div className={styles.slippage_content}>
                    <div className={styles.input_container}>
                        <input
                            id='slippage_tolerance_input_field'
                            onChange={(e) => {
                                console.log(e.target.value);
                                setSlippage(e.target.value);
                            }}
                            type='text'
                            value={slippageValue}
                            placeholder={'slippage'}
                        />
                    </div>
                    <button onClick={() => setSlippage(preset1)}>{preset1}%</button>
                    <button onClick={() => setSlippage(preset2)}>{preset2}%</button>
                    <button onClick={() => setSlippage(preset3)}>{preset3}%</button>
                    {/* <button onClick={() => setSlippage('0.5')}>0.5%</button>
                    <button onClick={() => setSlippage('1')}>1%</button> */}
                </div>
            </div>
        </div>
    );
}
