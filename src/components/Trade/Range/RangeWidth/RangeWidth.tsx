// START: Import React and Dongles
import { Dispatch, SetStateAction } from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { FiMinus } from 'react-icons/fi';
import { MdAdd } from 'react-icons/md';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { setRescaleRangeBoundaries } from '../../../../utils/state/tradeDataSlice';

// START: Import Local Files
import styles from './RangeWidth.module.css';
import { updateRangeWithButton, handleRangeSlider } from './rangeWidthFunctions';

// interface for React functional component props
interface RangeWidthPropsIF {
    rangeWidthPercentage: number;
    setRangeWidthPercentage: Dispatch<SetStateAction<number>>;
    isRangeCopied: boolean;
}

// React functional component
export default function RangeWidth(props: RangeWidthPropsIF) {
    const { rangeWidthPercentage, setRangeWidthPercentage, isRangeCopied } = props;

    const dispatch = useAppDispatch();

    const PercentageOptionContent = (
        <>
            <div className={styles.percentage_options}>
                <div className={styles.add_minus_icons}>
                    <MdAdd size={12} />
                    <FiMinus size={12} />
                </div>
                <button
                    className={styles.percentage_option_buttons}
                    onClick={() => {
                        updateRangeWithButton((1 / 20) * 100, setRangeWidthPercentage);
                        dispatch(setRescaleRangeBoundaries(true));
                    }}
                >
                    5%
                </button>
                <button
                    className={styles.percentage_option_buttons}
                    onClick={() => {
                        updateRangeWithButton((1 / 10) * 100, setRangeWidthPercentage);
                        dispatch(setRescaleRangeBoundaries(true));
                    }}
                >
                    10%
                </button>
                <button
                    className={styles.percentage_option_buttons}
                    onClick={() => {
                        updateRangeWithButton((1 / 4) * 100, setRangeWidthPercentage);
                        dispatch(setRescaleRangeBoundaries(true));
                    }}
                >
                    25%
                </button>
                <button
                    className={styles.percentage_option_buttons}
                    onClick={() => {
                        updateRangeWithButton((1 / 2) * 100, setRangeWidthPercentage);
                        dispatch(setRescaleRangeBoundaries(true));
                    }}
                >
                    50%
                </button>

                <button
                    className={styles.percentage_option_buttons}
                    onClick={() => {
                        updateRangeWithButton(100, setRangeWidthPercentage);
                        dispatch(setRescaleRangeBoundaries(true));
                    }}
                >
                    Ambient
                </button>
                <AiOutlineInfoCircle color='#ffffff' />
            </div>
        </>
    );

    return (
        <div className={styles.range_width_container}>
            <div className={styles.range_width_content}>
                {PercentageOptionContent}
                <span
                    className={`${styles.percentage_amount} ${
                        isRangeCopied && styles.pulse_animation
                    }`}
                    id='percentage-output'
                >
                    {rangeWidthPercentage === 100 ? 'Ambient' : '± ' + rangeWidthPercentage + '%'}
                </span>
                <div className={styles.range_width_input}>
                    <input
                        size={28}
                        aria-labelledby='input slider'
                        id='input-slider-range'
                        min='1'
                        max='100'
                        step='1'
                        defaultValue={rangeWidthPercentage}
                        type='range'
                        className={styles.percentage_input}
                        onChange={(event) => handleRangeSlider(event, setRangeWidthPercentage)}
                        onMouseUp={() => dispatch(setRescaleRangeBoundaries(true))}
                    />
                </div>

                <div className={styles.percentage_container}></div>
            </div>
        </div>
    );
}
