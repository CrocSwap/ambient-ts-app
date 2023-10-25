import { Dispatch, SetStateAction } from 'react';
import { useSlippageInput } from '../../../utils/hooks/useSlippageInput';
import styles from './RangeActionSettings.module.css';

interface propsIF {
    persistedSlippage: number;
    setCurrentSlippage: Dispatch<SetStateAction<number>>;
    presets: number[];
}

export default function RangeActionSettings(props: propsIF) {
    const { persistedSlippage, setCurrentSlippage, presets } = props;

    const [slip, takeNewSlippage] = useSlippageInput(
        persistedSlippage,
        setCurrentSlippage,
    );

    // union type pf number-literal values in presets array
    type presetValues = typeof presets[number];

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
                                id='range_action_slippage_tolerance_input_field'
                                onChange={(e) =>
                                    takeNewSlippage(e.target.value)
                                }
                                type='text'
                                value={slip}
                                placeholder={'slippage'}
                            />
                        </div>
                        {presets.map((preset: presetValues) => {
                            // convert raw preset value to human-readable string
                            const humanReadable: string = preset + '%';
                            // create a `<button>` element for each defined preset
                            return (
                                <button
                                    key={preset}
                                    id={`rmv-preset-button-${humanReadable}`}
                                    onClick={() => takeNewSlippage(preset)}
                                >
                                    {humanReadable}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
