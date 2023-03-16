import { Dispatch, SetStateAction } from 'react';
import styles from './HarvestPositionSettings.module.css';
import { useHarvestSlippage } from './useHarvestSlippage';

interface propsIF {
    persistedSlippage: number;
    setCurrentSlippage: Dispatch<SetStateAction<number>>;
    presets: number[];
}

export default function HarvestPositionSettings(props: propsIF) {
    const { persistedSlippage, setCurrentSlippage, presets } = props;

    const [slip, takeNewSlippage] = useHarvestSlippage(
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
                                id='harvest_position_slippage_tolerance_input_field'
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
