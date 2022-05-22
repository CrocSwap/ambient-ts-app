import styles from './RangeDenominationSwitch.module.css';
import { SetStateAction } from 'react';

interface IRangeDenominationSwitchProps {
    setDenominationsInBase: React.Dispatch<SetStateAction<boolean>>;
    denominationsInBase: boolean;
}

export default function RangeDenominationSwitch(props: IRangeDenominationSwitchProps) {
    const toggleDenomination = () => {
        props.denominationsInBase
            ? props.setDenominationsInBase(false)
            : props.setDenominationsInBase(true);
    };

    return (
        <div className={styles.denomination_switch}>
            <div>Denomination</div>
            <div className={styles.denomination_content}>
                <button onClick={toggleDenomination}>ETH</button>
            </div>
            <div className={styles.denomination_content}>
                {' '}
                <span>DAI</span>
            </div>
        </div>
    );
}
