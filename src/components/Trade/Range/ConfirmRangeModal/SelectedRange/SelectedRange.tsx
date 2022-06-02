import styles from './SelectedRange.module.css';
import { useState } from 'react';

export default function SelectedRange() {
    const [reverseDisplay, setReverseDisplay] = useState(false);

    const tokenAShortName = 'ETH';
    const tokenBShortName = 'DAI';

    const switchButtons = (
        <div className={styles.button_container}>
            <button
                onClick={() => {
                    setReverseDisplay(!reverseDisplay);
                }}
                className={reverseDisplay ? styles.active_button : styles.non_active_button}
            >
                {tokenAShortName}
            </button>
            <button
                onClick={() => {
                    setReverseDisplay(!reverseDisplay);
                }}
                className={reverseDisplay ? styles.non_active_button : styles.active_button}
            >
                {tokenBShortName}
            </button>
        </div>
    );

    return (
        <>
            <div className={styles.selected_range}>
                <div>Selected Range</div>
                {switchButtons}
            </div>
        </>
    );
}
