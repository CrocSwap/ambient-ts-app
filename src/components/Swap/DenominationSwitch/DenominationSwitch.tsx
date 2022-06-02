import styles from './DenominationSwitch.module.css';
import { useState } from 'react';
import { TokenIF } from '../../../utils/interfaces/TokenIF';

// interface for props
interface denominationSwitchProps {
    tokenPair: {
        dataTokenA: TokenIF;
        dataTokenB: TokenIF;
    };
    isOnTradeRoute?: boolean;
}

export default function DenominationSwitch(props: denominationSwitchProps) {
    const { tokenPair } = props;

    const [toggleDenomination, setToggleDenomination] = useState<boolean>(false);

    // TODO:  @Junior, if both buttons have the same action of reversing the current
    // TODO:  ... value of `toggleDenomination`, let's do just one button with two
    // TODO   ... <div> elements nested inside of it

    return (
        <div className={styles.denomination_switch}>
            <div>Denomination</div>
            <button
                className={!toggleDenomination ? styles.active_button : styles.non_active_button}
                onClick={() => setToggleDenomination(!toggleDenomination)}
            >
                {tokenPair.dataTokenA.symbol}
            </button>

            <button
                className={toggleDenomination ? styles.active_button : styles.non_active_button}
                onClick={() => setToggleDenomination(!toggleDenomination)}
            >
                {tokenPair.dataTokenB.symbol}
            </button>
        </div>
    );
}
