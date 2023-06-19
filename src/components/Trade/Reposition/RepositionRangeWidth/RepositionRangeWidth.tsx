import { Dispatch, memo, SetStateAction, useContext } from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';

import { RangeContext } from '../../../../contexts/RangeContext';
import styles from './RepositionRangeWidth.module.css';
import {
    updateRangeWithButton,
    handleRangeSlider,
} from './repositionRangeWidthFunctions';
import { AppStateContext } from '../../../../contexts/AppStateContext';

interface IRepositionRangeWidth {
    rangeWidthPercentage: number;
    setRangeWidthPercentage: Dispatch<SetStateAction<number>>;
}

function RepositionRangeWidth(props: IRepositionRangeWidth) {
    const { rangeWidthPercentage, setRangeWidthPercentage } = props;

    const { setRescaleRangeBoundariesWithSlider } = useContext(RangeContext);

    // todo
    // @anyone working on this. I think we could refactor the RangeWidth component and reuse it here but I know this might take a few different functionalities so to simplify things, I have created an entirely new component for it. The workflow should follow a similar approach to RangeWidth.tsx so take a look at that for some guidance, especially rangeWidthFunctions.ts.
    // Also, don't forget the input ids will be different. -JR

    const {
        globalPopup: { open: openGlobalPopup },
    } = useContext(AppStateContext);

    const PercentageOptionContent = (
        <div className={styles.percentage_options}>
            <button
                className={styles.percentage_option_buttons}
                onClick={() => {
                    updateRangeWithButton(
                        (1 / 20) * 100,
                        setRangeWidthPercentage,
                    );
                    setRescaleRangeBoundariesWithSlider(true);
                }}
            >
                5%
            </button>
            <button
                className={styles.percentage_option_buttons}
                onClick={() => {
                    updateRangeWithButton(
                        (1 / 10) * 100,
                        setRangeWidthPercentage,
                    );
                    setRescaleRangeBoundariesWithSlider(true);
                }}
            >
                10%
            </button>
            <button
                className={styles.percentage_option_buttons}
                onClick={() => {
                    updateRangeWithButton(
                        (1 / 4) * 100,
                        setRangeWidthPercentage,
                    );
                    setRescaleRangeBoundariesWithSlider(true);
                }}
            >
                25%
            </button>
            <button
                className={styles.percentage_option_buttons}
                onClick={() => {
                    updateRangeWithButton(
                        (1 / 2) * 100,
                        setRangeWidthPercentage,
                    );
                    setRescaleRangeBoundariesWithSlider(true);
                }}
            >
                50%
            </button>
            <button
                className={styles.percentage_option_buttons}
                onClick={() => {
                    updateRangeWithButton(100, setRangeWidthPercentage);
                    setRescaleRangeBoundariesWithSlider(true);
                }}
            >
                Ambient
            </button>
            <button
                onClick={() =>
                    openGlobalPopup(
                        <div>
                            Ambient liquidity remains fully in range regardless
                            of pool price, but accumulates rewards at lower
                            rates.
                        </div>,
                        'Ambient Range Width',
                        'right',
                    )
                }
                className={styles.explanation_button}
                aria-label='Open range width explanation popup.'
            >
                <AiOutlineInfoCircle color='#ffffff' />
            </button>
        </div>
    );

    return (
        <div className={styles.range_width_container}>
            <div className={styles.range_width_content}>
                {PercentageOptionContent}
                <span
                    className={styles.percentage_amount}
                    id='reposition-percentage-output'
                >
                    {rangeWidthPercentage === 100
                        ? 'Ambient'
                        : '± ' + rangeWidthPercentage + '%'}
                </span>
                <div className={styles.range_width_input}>
                    <input
                        size={28}
                        aria-labelledby='reposition-input slider'
                        id='reposition-input-slider-range'
                        min='1'
                        max='100'
                        step='1'
                        defaultValue={10}
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

export default memo(RepositionRangeWidth);
