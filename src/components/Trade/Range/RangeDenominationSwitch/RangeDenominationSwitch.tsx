import styles from './RangeDenominationSwitch.module.css';
import { SetStateAction } from 'react';

interface IRangeDenominationSwitchProps {
    setDenominationsInBase: React.Dispatch<SetStateAction<boolean>>;
    denominationsInBase: boolean;
}

export default function RangeDenominationSwitch(props: IRangeDenominationSwitchProps) {
    const { denominationsInBase, setDenominationsInBase } = props;
    const toggleDenomination = () => {
        denominationsInBase ? setDenominationsInBase(false) : setDenominationsInBase(true);
    };

    return (
        <div className={styles.denomination_switch}>
            <div>Denomination</div>
            <button
                className={!denominationsInBase ? styles.active_button : styles.non_active_button}
                onClick={toggleDenomination}
            >
                ETH
            </button>

            <button
                className={denominationsInBase ? styles.active_button : styles.non_active_button}
                onClick={toggleDenomination}
            >
                DAI
            </button>
        </div>
    );
}
