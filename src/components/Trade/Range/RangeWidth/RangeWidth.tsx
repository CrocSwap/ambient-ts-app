// import { ChangeEvent } from 'react';
import styles from './RangeWidth.module.css';
import { MdAdd } from 'react-icons/md';
import { FiMinus } from 'react-icons/fi';

export default function RangeWidth() {
    const PercentageOptionContent = (
        <>
            <div className={styles.percentage_options}>
                <div className={styles.add_minus_icons}>
                    <MdAdd size={22} />
                    <FiMinus size={22} />
                </div>
                <button className={styles.percentage_option_buttons}>50%</button>
                <button className={styles.percentage_option_buttons}>100%</button>
                <button className={styles.percentage_option_buttons}>200%</button>

                <button className={styles.percentage_option_buttons}>Ambient</button>
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
                        defaultValue={60}
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
