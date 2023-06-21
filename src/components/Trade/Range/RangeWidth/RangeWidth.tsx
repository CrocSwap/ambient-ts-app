// START: Import React and Dongles
import { Dispatch, memo, SetStateAction, useContext } from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';

import { AppStateContext } from '../../../../contexts/AppStateContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';

// START: Import Local Files
import styles from './RangeWidth.module.css';
import {
    updateRangeWithButton,
    handleRangeSlider,
} from './rangeWidthFunctions';

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

    const PercentageOptionContent = (
        <>
            <div className={styles.percentage_options}>
                <button
                    className={
                        rangeWidthPercentage === 5
                            ? `${styles.percentage_option_buttons} ${styles.matching_percentage_button}`
                            : styles.percentage_option_buttons
                    }
                    onClick={() => {
                        updateRangeWithButton(
                            (1 / 20) * 100,
                            setRangeWidthPercentage,
                        );
                        setRescaleRangeBoundariesWithSlider(true);
                    }}
                    aria-label='Set range width to 5%.'
                >
                    5%
                </button>
                <button
                    className={
                        rangeWidthPercentage === 10
                            ? `${styles.percentage_option_buttons} ${styles.matching_percentage_button}`
                            : styles.percentage_option_buttons
                    }
                    onClick={() => {
                        updateRangeWithButton(
                            (1 / 10) * 100,
                            setRangeWidthPercentage,
                        );
                        setRescaleRangeBoundariesWithSlider(true);
                    }}
                    aria-label='Set range width to 10%.'
                >
                    10%
                </button>
                <button
                    className={
                        rangeWidthPercentage === 25
                            ? `${styles.percentage_option_buttons} ${styles.matching_percentage_button}`
                            : styles.percentage_option_buttons
                    }
                    onClick={() => {
                        updateRangeWithButton(
                            (1 / 4) * 100,
                            setRangeWidthPercentage,
                        );
                        setRescaleRangeBoundariesWithSlider(true);
                    }}
                    aria-label='Set range width to 25%.'
                >
                    25%
                </button>
                <button
                    className={
                        rangeWidthPercentage === 50
                            ? `${styles.percentage_option_buttons} ${styles.matching_percentage_button}`
                            : styles.percentage_option_buttons
                    }
                    onClick={() => {
                        updateRangeWithButton(
                            (1 / 2) * 100,
                            setRangeWidthPercentage,
                        );
                        setRescaleRangeBoundariesWithSlider(true);
                    }}
                    aria-label='Set range width to 50%.'
                >
                    50%
                </button>

                <button
                    className={
                        rangeWidthPercentage === 100
                            ? `${styles.percentage_option_buttons} ${styles.matching_percentage_button}`
                            : styles.percentage_option_buttons
                    }
                    onClick={() => {
                        updateRangeWithButton(100, setRangeWidthPercentage);
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
                            price
                        </p>
                        <p>
                            Tighter ranges accumulate rewards at faster, but are
                            more likely to suffer divergence losses
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
            <div className={styles.range_width_content}>
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
                    <input
                        size={28}
                        aria-labelledby='input slider'
                        aria-label='Input slider for range width'
                        id='input-slider-range'
                        min='1'
                        max='100'
                        step='1'
                        defaultValue={rangeWidthPercentage}
                        type='range'
                        className={styles.percentage_input}
                        onChange={(event) =>
                            handleRangeSlider(event, setRangeWidthPercentage)
                        }
                        onClick={() => {
                            setRescaleRangeBoundariesWithSlider(true);
                        }}
                    />
                </div>

                <div className={styles.percentage_container}></div>
            </div>
        </div>
    );
}

export default memo(RangeWidth);
