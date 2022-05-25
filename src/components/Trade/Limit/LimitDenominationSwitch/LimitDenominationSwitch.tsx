import styles from './LimitDenominationSwitch.module.css';
import { useState } from 'react';

export default function LimitDenominationSwitch() {
    const [toggleDenomination, setToggleDenomination] = useState<boolean>(false);

    return (
        <div className={styles.denomination_switch}>
            <div>Denomination</div>
            <button
                className={!toggleDenomination ? styles.active_button : styles.non_active_button}
                onClick={() => setToggleDenomination(!toggleDenomination)}
            >
                ETH
            </button>

            <button
                className={toggleDenomination ? styles.active_button : styles.non_active_button}
                onClick={() => setToggleDenomination(!toggleDenomination)}
            >
                DAI
            </button>
        </div>
    );
}
