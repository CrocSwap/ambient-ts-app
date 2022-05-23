// import { ChangeEvent } from 'react';
import styles from './RangeWidth.module.css';
import { MdAdd } from 'react-icons/md';
import { FiMinus } from 'react-icons/fi';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { updateRangeWithButton, handleRangeSlider } from './rangeWidthFunctions';

interface IRangeWidthProps {
    rangeWidthPercentage: number;
    setRangeWidthPercentage: React.Dispatch<React.SetStateAction<number>>;
}

export default function RangeWidth(props: IRangeWidthProps) {
    const { rangeWidthPercentage, setRangeWidthPercentage } = props;

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
                        updateRangeWithButton((1 / 10) * 100, setRangeWidthPercentage);
                    }}
                >
                    10%
                </button>
                <button
                    className={styles.percentage_option_buttons}
                    onClick={() => {
                        updateRangeWithButton((1 / 4) * 100, setRangeWidthPercentage);
                    }}
                >
                    25%
                </button>
                <button
                    className={styles.percentage_option_buttons}
                    onClick={() => {
                        updateRangeWithButton((1 / 2) * 100, setRangeWidthPercentage);
                    }}
                >
                    50%
                </button>

                <button
                    className={styles.percentage_option_buttons}
                    onClick={() => {
                        updateRangeWithButton(100, setRangeWidthPercentage);
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
                <span className={styles.percentage_amount} id='percentage-output'>
                    {rangeWidthPercentage === 100 ? 'Ambient' : '± ' + rangeWidthPercentage + '%'}
                </span>
                <div className={styles.range_width_input}>
                    <input
                        size={28}
                        aria-labelledby='input slider'
                        id='input-slider-range'
                        min='10'
                        max='100'
                        step='1'
                        defaultValue={rangeWidthPercentage}
                        type='range'
                        className={styles.percentage_input}
                        onChange={(event) => handleRangeSlider(event, setRangeWidthPercentage)}
                    />
                </div>

                <div className={styles.percentage_container}></div>
            </div>
        </div>
    );
}
