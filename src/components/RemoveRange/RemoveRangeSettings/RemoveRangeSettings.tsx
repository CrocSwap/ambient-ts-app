import { Dispatch, SetStateAction, useState } from 'react';
import styles from './RemoveRangeSettings.module.css';

interface propsIF {
    isPairStable: boolean;
    persistedSlippage: number;
    setCurrentSlippage: Dispatch<SetStateAction<number>>;
}

export default function RemoveRangeSettings(props: propsIF) {
    const { isPairStable, persistedSlippage, setCurrentSlippage } = props;

    // this layer is necessary to make the `<input />` responsive to change
    // future Emily this is past Emily yes you're going to hate this
    // ... implementation but please trust me it really is necessary
    const [slip, setSlip] = useState<number>(persistedSlippage);

    // update local in-flile slippage in parallel with slippage in parent
    const takeNewSlippage = (val: number): void => {
        setSlip(val);
        setCurrentSlippage(val);
    };

    // preset values, first set is for stable pairs, second is for volatile
    const presets: number[] = isPairStable ? [1, 2, 3] : [1, 2, 3];

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
                        {presets.map((preset) => (
                            <button
                                key={`rmv-preset-button-${preset}`}
                                onClick={() => takeNewSlippage(preset)}
                            >
                                {preset}%
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
