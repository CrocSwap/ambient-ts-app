import { Dispatch, SetStateAction } from 'react';
import { useSlippageInput } from '../../../utils/hooks/useSlippageInput';
import styles from './SlippageTolerance.module.css';

interface propsIF {
    persistedSlippage: number;
    setCurrentSlippage: Dispatch<SetStateAction<number>>;
    handleKeyDown: (event: { keyCode: number }) => void;
    presets: number[];
}

export default function SlippageTolerance(props: propsIF) {
    const { persistedSlippage, setCurrentSlippage, handleKeyDown, presets } =
        props;

    const [slip, takeNewSlippage] = useSlippageInput(
        persistedSlippage,
        setCurrentSlippage,
    );

    return (
        <div className={styles.slippage_tolerance_container}>
            <div className={styles.slippage_title}>Slippage Tolerance (%)</div>
            <div className={styles.slippage_box}>
                <div className={styles.slippage_content}>
                    <div className={styles.input_container}>
                        <input
                            id='slippage_tolerance_input_field'
                            onChange={(e) => takeNewSlippage(e.target.value)}
                            type='number'
                            value={slip}
                            autoComplete={'off'}
                            placeholder={'e.g. 0.3'}
                            onKeyDown={handleKeyDown}
                            aria-label='Enter Slippage Tolerance'
                        />
                    </div>
                    {presets.map((preset: number) => (
                        <button
                            tabIndex={0}
                            key={`slippage-preset-button-${preset}`}
                            onClick={() => takeNewSlippage(preset)}
                            aria-label={`set slippage to ${preset}% `}
                        >
                            {preset}%
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
