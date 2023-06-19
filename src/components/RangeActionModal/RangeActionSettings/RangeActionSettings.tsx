import { Dispatch, SetStateAction } from 'react';
import { useSlippageInput } from '../../../utils/hooks/useSlippageInput';
import styles from './RangeActionSettings.module.css';

interface RangeActionSettingsIF {
    persistedSlippage: number;
    setCurrentSlippage: Dispatch<SetStateAction<number>>;
    presets: number[];
}

export default function RangeActionSettings(props: RangeActionSettingsIF) {
    const { persistedSlippage, setCurrentSlippage, presets } = props;

    const [slip, takeNewSlippage] = useSlippageInput(
        persistedSlippage,
        setCurrentSlippage,
    );

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
