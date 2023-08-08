import { Dispatch, SetStateAction } from 'react';
import styles from './RemoveRangeWidth.module.css';
import RangeSlider from '../../Global/RangeSlider/RangeSlider';

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
                    className={
                        removalPercentage === 10
                            ? `${styles.matching_percentage_button}`
                            : styles.percentage_option_buttons
                    }
                    onClick={() => {
                        handlePercentageUpdate(10);
                    }}
                >
                    10%
                </button>
                <button
                    className={
                        removalPercentage === 25
                            ? `${styles.matching_percentage_button}`
                            : styles.percentage_option_buttons
                    }
                    onClick={() => {
                        handlePercentageUpdate(25);
                    }}
                >
                    25%
                </button>
                <button
                    className={
                        removalPercentage === 50
                            ? `${styles.matching_percentage_button}`
                            : styles.percentage_option_buttons
                    }
                    onClick={() => {
                        handlePercentageUpdate(50);
                    }}
                >
                    50%
                </button>

                <button
                    className={
                        removalPercentage === 100
                            ? `${styles.matching_percentage_button}`
                            : styles.percentage_option_buttons
                    }
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
                    <RangeSlider
                        className={styles.percentage_input}
                        aria-labelledby='input slider'
                        defaultValue={removalPercentage}
                        id='remove-range-slider'
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
