import { Dispatch, SetStateAction, useState } from 'react';
import styles from './RemoveRangeSettings.module.css';

interface propsIF {
    persistedSlippage: number;
    setCurrentSlippage: Dispatch<SetStateAction<number>>;
}

export default function RemoveRangeSettings(props: propsIF) {
    const { persistedSlippage, setCurrentSlippage } = props;

    const preset1 = 0.1;
    const preset2 = 0.3;
    const preset3 = 0.5;

    // this layer is necessary to make the `<input />` responsive to change
    // future Emily this is past Emily yes you're going to hate this
    // ... implementation but please trust me it really is necessary
    const [slip, setSlip] = useState<number>(persistedSlippage);

    // update local in-flile slippage in parallel with slippage in parent
    const takeNewSlippage = (val: number): void => {
        setSlip(val);
        setCurrentSlippage(val);
    };

    return (
        <div className={styles.main_container}>
            <div className={styles.slippage_tolerance_container}>
                <div className={styles.slippage_title}>
                    Slippage Tolerance (%)
                </div>
                <div className={styles.slippage_box}>
                    <div className={styles.slippage_content}>
                        <div className={styles.input_container}>
                            <input
                                id='remove_range_slippage_tolerance_input_field'
                                onChange={(e) =>
                                    takeNewSlippage(parseFloat(e.target.value))
                                }
                                type='text'
                                value={slip}
                                placeholder={'slippage'}
                            />
                        </div>
                        <button onClick={() => takeNewSlippage(preset1)}>
                            {preset1}%
                        </button>
                        <button onClick={() => takeNewSlippage(preset2)}>
                            {preset2}%
                        </button>
                        <button onClick={() => takeNewSlippage(preset3)}>
                            {preset3}%
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
