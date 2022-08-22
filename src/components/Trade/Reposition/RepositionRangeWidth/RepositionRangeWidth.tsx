import { AiOutlineInfoCircle } from 'react-icons/ai';
import { FiMinus } from 'react-icons/fi';
import { MdAdd } from 'react-icons/md';
import styles from './RepositionRangeWidth.module.css';

export default function RepositionRangeWidth() {
    const rangeWidthPercentage = 100;

    // todo
    // @anyone working on this. I think we could refactor the RangeWidth component and reuse it here but I know this might take a few different functionalities so to simplify things, I have created an entirely new component for it. The workflow should follow a similar approach to RangeWidth.tsx so take a look at that for some guidance, especially rangeWidthFunctions.ts.
    // Also, don't forget the input ids will be different. -JR

    const PercentageOptionContent = (
        <div className={styles.percentage_options}>
            <div className={styles.add_minus_icons}>
                <MdAdd size={22} />
                <FiMinus size={22} />
            </div>
            <button className={styles.percentage_option_buttons}>
                10%
            </button>
            <button className={styles.percentage_option_buttons}>
                25%
            </button>
            <button className={styles.percentage_option_buttons}>
                50%
            </button>
            <button className={styles.percentage_option_buttons}>
                Ambient
            </button>
            <AiOutlineInfoCircle color='#ffffff' />
        </div>
    );

    return (
        <div className={styles.range_width_container}>
            <div className={styles.range_width_content}>
                {PercentageOptionContent}
                <span className={styles.percentage_amount} id='reposition-percentage-output'>
                    {rangeWidthPercentage === 100 ? 'Ambient' : '± ' + rangeWidthPercentage + '%'}
                </span>
                <div className={styles.range_width_input}>
                    <input
                        size={28}
                        aria-labelledby='reposition-input slider'
                        id='reposition-input-slider-range'
                        min='10'
                        max='100'
                        step='1'
                        defaultValue={rangeWidthPercentage}
                        type='range'
                        className={styles.percentage_input}
                    />
                </div>

                <div className={styles.percentage_container}></div>
            </div>
        </div>
    );
}
