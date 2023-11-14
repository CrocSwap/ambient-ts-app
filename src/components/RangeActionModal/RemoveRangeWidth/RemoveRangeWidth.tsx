import { Dispatch, SetStateAction } from 'react';
import styles from './RemoveRangeWidth.module.css';
import RangeSlider from '../../Form/RangeSlider';

interface propsIF {
    removalPercentage: number;
    setRemovalPercentage: Dispatch<SetStateAction<number>>;
}

export default function RemoveRangeWidth(props: propsIF) {
    const { removalPercentage, setRemovalPercentage } = props;

    // values to generate remove liquidity preset buttons
    const removalPresets: number[] = [10, 25, 50, 100];
    // type annotation as union of number-literals in `removalPresets`
    type presetValues = typeof removalPresets[number];

    // id attribute for removal slider input (referenced in multiple places)
    const sliderFieldId = 'remove-range-slider';

    const handlePercentageUpdate = (percentage: number): void => {
        setRemovalPercentage(percentage);
        const sliderInputField = document.getElementById(sliderFieldId);
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
                        // convert raw preset to a human-readable string
                        const humanReadable: string = preset + '%';
                        // create a `<button>` element for each preset value
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
                        id={sliderFieldId}
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
