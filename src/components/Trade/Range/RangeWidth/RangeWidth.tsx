// import { ChangeEvent } from 'react';
import styles from './RangeWidth.module.css';
import { MdAdd } from 'react-icons/md';
import { FiMinus } from 'react-icons/fi';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { useCallback } from 'react';
import truncateDecimals from '../../../../utils/data/truncateDecimals';

interface IRangeWidthProps {
    rangeWidthPercentage: number;
    setRangeWidthPercentage: React.Dispatch<React.SetStateAction<number>>;
}

export default function RangeWidth(props: IRangeWidthProps) {
    const { rangeWidthPercentage, setRangeWidthPercentage } = props;

    // function transformValue(input: number) {
    //     //   const numInput = parseFloat(input);
    //     const scaledInput = input / (100 - input);
    //     const output = truncateDecimals(scaledInput * 100, 2);

    //     return output;
    // }

    const updateRangeWithButton = useCallback(
        (value: number) => {
            const inputSlider = document.getElementById('input-slider-reposition');
            const valueString = value.toString();
            if (inputSlider && valueString) {
                (inputSlider as HTMLInputElement).value = valueString;
            }
            const truncatedValue = truncateDecimals(value, 2);
            // const humanReadableValue = transformValue(value);

            setRangeWidthPercentage(truncatedValue);
        },
        [setRangeWidthPercentage],
    );

    const PercentageOptionContent = (
        <>
            <div className={styles.percentage_options}>
                <div className={styles.add_minus_icons}>
                    <MdAdd size={22} />
                    <FiMinus size={22} />
                </div>
                <button
                    className={styles.percentage_option_buttons}
                    onClick={() => {
                        updateRangeWithButton((1 / 10) * 100);
                    }}
                >
                    10%
                </button>
                <button
                    className={styles.percentage_option_buttons}
                    onClick={() => {
                        updateRangeWithButton((1 / 4) * 100);
                    }}
                >
                    25%
                </button>
                <button
                    className={styles.percentage_option_buttons}
                    onClick={() => {
                        updateRangeWithButton((1 / 2) * 100);
                    }}
                >
                    50%
                </button>

                <button
                    className={styles.percentage_option_buttons}
                    onClick={() => {
                        updateRangeWithButton(100);
                    }}
                >
                    Ambient
                </button>
                <AiOutlineInfoCircle color='#ffffff' />
            </div>
        </>
    );

    return (
        <div className={styles.reposition_width_container}>
            <div className={styles.reposition_width_content}>
                {PercentageOptionContent}
                <span className={styles.percentage_amount} id='percentage-output'>
                    {rangeWidthPercentage === 100 ? 'Ambient' : rangeWidthPercentage + '%'}
                </span>
                <div className={styles.reposition_width_input}>
                    <input
                        size={28}
                        aria-labelledby='input slider'
                        id='input-slider-reposition'
                        min='10'
                        max='100'
                        step='1'
                        defaultValue={100}
                        type='range'
                        className={styles.percentage_input}
                        //   onChange={handleRespositionSlider}
                    />
                </div>

                <div className={styles.percentage_container}></div>
            </div>
        </div>
    );
}
