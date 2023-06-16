import { Dispatch, SetStateAction } from 'react';
import styles from './RemoveRangeWidth.module.css';

interface RemoveRangeWidthPropsIF {
    removalPercentage: number;
    setRemovalPercentage: Dispatch<SetStateAction<number>>;
}

export default function RemoveRangeWidth(props: RemoveRangeWidthPropsIF) {
    const { removalPercentage, setRemovalPercentage } = props;

    const handlePercentageUpdate = (percentage: number) => {
        setRemovalPercentage(percentage);
        const sliderInputField = document.getElementById('remove-range-slider');
        if (sliderInputField) {
            (sliderInputField as HTMLInputElement).value =
                percentage.toString();
        }
    };
    const PercentageOptionContent = (
        <>
            <div className={styles.percentage_options}>
                <span
                    className={styles.percentage_amount}
                    id='remove-percentage-output'
                >
                    {removalPercentage}%
                </span>
                <button
                    className={styles.percentage_option_buttons}
                    onClick={() => {
                        handlePercentageUpdate(10);
                    }}
                >
                    10%
                </button>
                <button
                    className={styles.percentage_option_buttons}
                    onClick={() => {
                        handlePercentageUpdate(25);
                    }}
                >
                    25%
                </button>
                <button
                    className={styles.percentage_option_buttons}
                    onClick={() => {
                        handlePercentageUpdate(50);
                    }}
                >
                    50%
                </button>

                <button
                    className={styles.percentage_option_buttons}
                    onClick={() => {
                        handlePercentageUpdate(100);
                    }}
                >
                    100%
                </button>
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
                        min='1'
                        max='100'
                        step='1'
                        defaultValue={removalPercentage}
                        type='range'
                        className={styles.percentage_input}
                        onChange={(e) =>
                            handlePercentageUpdate(parseInt(e.target.value))
                        }
                    />
                </div>
                <div className={styles.percentage_container}></div>
            </div>
        </div>
    );
}
