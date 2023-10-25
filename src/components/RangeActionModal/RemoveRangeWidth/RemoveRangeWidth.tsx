import { Dispatch, SetStateAction } from 'react';
import styles from './RemoveRangeWidth.module.css';
import RangeSlider from '../../Form/RangeSlider';

interface RemoveRangeWidthPropsIF {
    removalPercentage: number;
    setRemovalPercentage: Dispatch<SetStateAction<number>>;
}

export default function RemoveRangeWidth(props: RemoveRangeWidthPropsIF) {
    const { removalPercentage, setRemovalPercentage } = props;

    // values to generate balanced mode preset buttons
    const removalPresets: number[] = [10, 25, 50, 100];
    // type annotation as union of number-literals in `removalPresets`
    type presetValues = typeof removalPresets[number];

    const handlePercentageUpdate = (percentage: number) => {
        setRemovalPercentage(percentage);
        const sliderInputField = document.getElementById('remove-range-slider');
        if (sliderInputField) {
            (sliderInputField as HTMLInputElement).value =
                percentage.toString();
        }
    };

    return (
        <div className={styles.range_width_container}>
            <span className={styles.title}>Amount</span>
            <div className={styles.range_width_content}>
                <div className={styles.percentage_options}>
                    <span
                        className={styles.percentage_amount}
                        id='remove-percentage-output'
                    >
                        {removalPercentage}%
                    </span>
                    {removalPresets.map((preset: presetValues) => {
                        const humanReadable: string = preset + '%';
                        return (
                            <button
                                key={preset.toString()}
                                id={`remove_liq_preset_${humanReadable}`}
                                className={
                                    removalPercentage === preset
                                        ? styles.matching_percentage_button
                                        : styles.percentage_option_buttons
                                }
                                onClick={() => handlePercentageUpdate(preset)}
                            >
                                {humanReadable}
                            </button>
                        );
                    })}
                </div>
                <div className={styles.range_width_input}>
                    <RangeSlider
                        percentageInput
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
