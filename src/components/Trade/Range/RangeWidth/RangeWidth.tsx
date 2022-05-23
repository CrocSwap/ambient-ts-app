// import { ChangeEvent } from 'react';
import { useState, useCallback, useMemo, useEffect } from 'react';

import styles from './RangeWidth.module.css';
import { MdAdd } from 'react-icons/md';
import { FiMinus } from 'react-icons/fi';
import { AiOutlineInfoCircle } from 'react-icons/ai';

export default function RangeWidth() {
    const [rangeValue, setRangeValue] = useState<number>();
    const [sliderValue, setSliderValue] = useState<string>('50');
    const [sliderDisabled, setSliderDisabled] = useState(false);

    const updateSliderAmount = useCallback((event: HTMLAttributes<HTMLInputElement>) => {
        const value = event.target.value;
        // console.log({ value });
        setRangeValue(value);
        setSliderValue(value);
    }, []);

    const PercentageOptionContent = (
        <>
            <div className={styles.percentage_options}>
                <div className={styles.add_minus_icons}>
                    <MdAdd size={22} />
                    <FiMinus size={22} />
                </div>
                <button className={styles.percentage_option_buttons}>10%</button>
                <button className={styles.percentage_option_buttons}>25%</button>
                <button className={styles.percentage_option_buttons}>50%</button>

                <button className={styles.percentage_option_buttons}>Ambient</button>
                <AiOutlineInfoCircle color='#ffffff' />
            </div>
        </>
    );

    return (
        <div className={styles.reposition_width_container}>
            <div className={styles.reposition_width_content}>
                {PercentageOptionContent}
                <span className={styles.percentage_amount} id='percentage-output'>
                    Ambient
                </span>
                <div className={styles.reposition_width_input}>
                    <input
                        size={28}
                        aria-labelledby='input slider'
                        id='input-slider-reposition'
                        min='20'
                        max='100'
                        step='1'
                        value={sliderValue}
                        defaultValue={60}
                        onChange={updateSliderAmount}
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
