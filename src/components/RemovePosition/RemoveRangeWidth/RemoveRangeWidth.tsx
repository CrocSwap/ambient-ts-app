// import { ChangeEvent } from 'react';

import styles from './RemoveRangeWidth.module.css';

export default function RemoveRangeWidth() {
    const PercentageOptionContent = (
        <>
            <div className={styles.percentage_options}>
                <span className={styles.percentage_amount} id='remove-percentage-output'>
                    100%
                </span>
                <button className={styles.percentage_option_buttons}>10%</button>
                <button className={styles.percentage_option_buttons}>25%</button>
                <button className={styles.percentage_option_buttons}>50%</button>

                <button className={styles.percentage_option_buttons}>100%</button>
            </div>
        </>
    );

    return (
        <div className={styles.range_width_container}>
            <span className={styles.title}>Amount</span>
            <div className={styles.range_width_content}>
                {PercentageOptionContent}

                <div className={styles.range_width_input}>
                    <input
                        size={28}
                        aria-labelledby='input slider'
                        id='remove-range-slider'
                        min='10'
                        max='100'
                        step='1'
                        defaultValue={100}
                        type='range'
                        className={styles.percentage_input}
                        onChange={(event) => console.log(event)}
                    />
                </div>

                <div className={styles.percentage_container}></div>
            </div>
        </div>
    );
}
