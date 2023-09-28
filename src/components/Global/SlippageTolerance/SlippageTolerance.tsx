import { Dispatch, SetStateAction, KeyboardEvent } from 'react';
import { useSlippageInput } from '../../../utils/hooks/useSlippageInput';
import styles from './SlippageTolerance.module.css';
import { Chip } from '../../Form/Chip';

interface propsIF {
    persistedSlippage: number;
    setCurrentSlippage: Dispatch<SetStateAction<number>>;
    handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
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
                            step='any'
                            value={slip}
                            autoComplete={'off'}
                            placeholder={'e.g. 0.3'}
                            onKeyDown={handleKeyDown}
                            aria-label='Enter Slippage Tolerance'
                        />
                    </div>
                    {presets.map((preset: number) => (
                        <Chip
                            key={`slippage-preset-button-${preset}`}
                            onClick={() => takeNewSlippage(preset)}
                            ariaLabel={`set slippage to ${preset}% `}
                        >{`${preset}%`}</Chip>
                    ))}
                </div>
            </div>
        </div>
    );
}
