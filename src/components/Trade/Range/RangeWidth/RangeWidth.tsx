// START: Import React and Dongles
import { Dispatch, memo, SetStateAction, useContext } from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';

import { AppStateContext } from '../../../../contexts/AppStateContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';

// START: Import Local Files
import styles from './RangeWidth.module.css';
import { handleRangeSlider } from './rangeWidthFunctions';
import RangeSlider from '../../../Global/RangeSlider/RangeSlider';
import truncateDecimals from '../../../../utils/data/truncateDecimals';

// interface for React functional component props
interface RangeWidthPropsIF {
    rangeWidthPercentage: number;
    setRangeWidthPercentage: Dispatch<SetStateAction<number>>;
    setRescaleRangeBoundariesWithSlider: Dispatch<SetStateAction<boolean>>;
}

// React functional component
function RangeWidth(props: RangeWidthPropsIF) {
    const {
        rangeWidthPercentage,
        setRangeWidthPercentage,
        setRescaleRangeBoundariesWithSlider,
    } = props;
    const {
        globalPopup: { open: openGlobalPopup },
    } = useContext(AppStateContext);
    const { showRangePulseAnimation } = useContext(TradeTableContext);

    // fn to update the width of range (balanced mode) from buttons
    function updateRangeWithButton(value: 5 | 10 | 25 | 50 | 100): void {
        // convert the numerical input to a string
        const valueString: string = value.toString();
        // locate the range adjustment slider in the DOM
        const inputSlider: HTMLElement | null =
            document.getElementById('input-slider-range');
        // set the range adjustment slider to the value provided in args
        if (inputSlider) {
            (inputSlider as HTMLInputElement).value = valueString;
        }
        // set the input value to two decimals of precision
        const truncatedValue: string = truncateDecimals(value, 2);
        // convert input value to a float and update range width
        setRangeWidthPercentage(parseFloat(truncatedValue));
    }

    const PercentageOptionContent = (
        <>
            <div className={styles.percentage_options}>
                <button
                    className={
                        rangeWidthPercentage === 5
                            ? `${styles.matching_percentage_button}`
                            : styles.percentage_option_buttons
                    }
                    onClick={() => {
                        updateRangeWithButton(5);
                        setRescaleRangeBoundariesWithSlider(true);
                    }}
                    aria-label='Set range width to 5%.'
                >
                    5%
                </button>
                <button
                    className={
                        rangeWidthPercentage === 10
                            ? `${styles.matching_percentage_button}`
                            : styles.percentage_option_buttons
                    }
                    onClick={() => {
                        updateRangeWithButton(10);
                        setRescaleRangeBoundariesWithSlider(true);
                    }}
                    aria-label='Set range width to 10%.'
                >
                    10%
                </button>
                <button
                    className={
                        rangeWidthPercentage === 25
                            ? `${styles.matching_percentage_button}`
                            : styles.percentage_option_buttons
                    }
                    onClick={() => {
                        updateRangeWithButton(25);
                        setRescaleRangeBoundariesWithSlider(true);
                    }}
                    aria-label='Set range width to 25%.'
                >
                    25%
                </button>
                <button
                    className={
                        rangeWidthPercentage === 50
                            ? `${styles.matching_percentage_button}`
                            : styles.percentage_option_buttons
                    }
                    onClick={() => {
                        updateRangeWithButton(50);
                        setRescaleRangeBoundariesWithSlider(true);
                    }}
                    aria-label='Set range width to 50%.'
                >
                    50%
                </button>
                <button
                    className={
                        rangeWidthPercentage === 100
                            ? `${styles.matching_percentage_button}`
                            : styles.percentage_option_buttons
                    }
                    onClick={() => {
                        updateRangeWithButton(100);
                        setRescaleRangeBoundariesWithSlider(true);
                    }}
                    aria-label='use Ambient range width.'
                >
                    Ambient
                </button>
                <button
                    onClick={() =>
                        openGlobalPopup(
                            <div>
                                Ambient liquidity remains fully in range
                                regardless of pool price, but accumulates
                                rewards at lower rates.
                            </div>,
                            'Ambient Range Width',
                            'right',
                        )
                    }
                    className={styles.explanation_button}
                    aria-label='Open range width explanation popup.'
                >
                    <AiOutlineInfoCircle color='var(--text2)' />
                </button>
            </div>
        </>
    );

    const rangeWidthTooltip = (
        <div
            style={{ margin: '0 8px', cursor: 'pointer' }}
            onClick={() =>
                openGlobalPopup(
                    <div>
                        <p>
                            Percentage width of the range around current pool
                            price.
                        </p>
                        <p>
                            Tighter ranges accumulate rewards at faster rates,
                            but are more likely to suffer divergence losses.
                        </p>
                    </div>,
                    'Range Width',
                    'right',
                )
            }
        >
            <AiOutlineInfoCircle size={17} />
        </div>
    );

    return (
        <div className={styles.range_width_container} id='range_width'>
            {PercentageOptionContent}
            <span
                className={`${styles.percentage_amount} ${
                    showRangePulseAnimation && styles.pulse_animation
                }`}
                id='percentage-output'
                aria-live='polite'
                aria-atomic='true'
                aria-relevant='all'
            >
                {rangeWidthPercentage === 100
                    ? 'Ambient'
                    : '± ' + rangeWidthPercentage + '%'}
                {rangeWidthTooltip}
            </span>
            <div className={styles.range_width_input}>
                <RangeSlider
                    className={styles.percentage_input}
                    defaultValue={rangeWidthPercentage}
                    id='input-slider-range'
                    onChange={(event) =>
                        handleRangeSlider(event, setRangeWidthPercentage)
                    }
                    onClick={() => {
                        setRescaleRangeBoundariesWithSlider(true);
                    }}
                />
            </div>
        </div>
    );
}

export default memo(RangeWidth);
