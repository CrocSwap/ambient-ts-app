import { Dispatch, SetStateAction, useState } from 'react';
import styles from './RemoveOrderWidth.module.css';

interface RemoveOrderWidthPropsIF {
    removalPercentage: number;
    setRemovalPercentage: Dispatch<SetStateAction<number>>;
}

export default function RemoveOrderWidth(props: RemoveOrderWidthPropsIF) {
    const { removalPercentage, setRemovalPercentage } = props;

    const handlePercentageUpdate = (percentage: number) => {
        setRemovalPercentage(percentage);
        const sliderInputField = document.getElementById('remove-order-slider');
        if (sliderInputField) {
            (sliderInputField as HTMLInputElement).value = percentage.toString();
        }
    };
    const PercentageOptionContent = (
        <>
            <div className={styles.percentage_options}>
                <span className={styles.percentage_amount} id='remove-order-percentage-output'>
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
    const [showPartial] = useState(true);

    const partialRemove = (
        <>
            {/* <span className={styles.title}>Removal Percentage</span> */}
            <div className={styles.order_width_content}>
                {PercentageOptionContent}
                <div className={styles.order_width_input}>
                    <input
                        size={28}
                        aria-labelledby='input slider'
                        id='remove-order-slider'
                        min='1'
                        max='100'
                        step='1'
                        defaultValue={removalPercentage}
                        type='range'
                        className={styles.percentage_input}
                        onChange={(e) => handlePercentageUpdate(parseInt(e.target.value))}
                    />
                </div>
                <div className={styles.percentage_container}></div>
            </div>
        </>
    );

    return (
        <div className={styles.order_width_container}>
            {/* <p
                onClick={() => setShowPartial(!showPartial)}
                style={{
                    fontSize: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '1rem 0',
                }}
            >
                Product Meeting Demo: Click to toggle partial control
            </p> */}
            {showPartial ? partialRemove : null}
            {/* <span className={styles.title}>Removal Percentage</span>
            <div className={styles.order_width_content}>
                {PercentageOptionContent}
                <div className={styles.order_width_input}>
                    <input
                        size={28}
                        aria-labelledby='input slider'
                        id='remove-order-slider'
                        min='1'
                        max='100'
                        step='1'
                        defaultValue={removalPercentage}
                        type='range'
                        className={styles.percentage_input}
                        onChange={(e) => handlePercentageUpdate(parseInt(e.target.value))}
                    />
                </div>
                <div className={styles.percentage_container}></div>
            </div> */}
        </div>
    );
}
