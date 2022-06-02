import styles from './RangeDenominationSwitch.module.css';
import { SetStateAction } from 'react';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';

interface IRangeDenominationSwitchProps {
    tokenPair: {
        dataTokenA: TokenIF;
        dataTokenB: TokenIF;
    };
    setDenominationsInBase: React.Dispatch<SetStateAction<boolean>>;
    denominationsInBase: boolean;
}

export default function RangeDenominationSwitch(props: IRangeDenominationSwitchProps) {
    const { tokenPair, denominationsInBase, setDenominationsInBase } = props;
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
                {tokenPair.dataTokenA.symbol}
            </button>

            <button
                className={denominationsInBase ? styles.active_button : styles.non_active_button}
                onClick={toggleDenomination}
            >
                {tokenPair.dataTokenB.symbol}
            </button>
        </div>
    );
}
