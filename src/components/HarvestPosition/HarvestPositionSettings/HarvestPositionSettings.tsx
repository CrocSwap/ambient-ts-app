import { Dispatch, SetStateAction, useState } from 'react';
import styles from './HarvestPositionSettings.module.css';

interface propsIF {
    persistedSlippage: number;
    setCurrentSlippage: Dispatch<SetStateAction<number>>;
    presets: number[];
}

export default function HarvestPositionSettings(props: propsIF) {
    const { persistedSlippage, setCurrentSlippage, presets } = props;

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
                                id='harvest_position_slippage_tolerance_input_field'
                                onChange={(e) =>
                                    takeNewSlippage(parseFloat(e.target.value))
                                }
                                type='text'
                                value={slip}
                                placeholder={'slippage'}
                            />
                        </div>
                        {presets.map((preset: number) => (
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
