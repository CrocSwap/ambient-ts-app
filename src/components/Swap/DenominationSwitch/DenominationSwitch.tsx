// TODO:  @Emily, this file exists in exact duplicate for the Swap/Market,
// TODO:  ... Limit, and Range modules; reduce this to one global component
// TODO:  ... file and import it into each module individually

// START: Import React and Dongles
import { useState } from 'react';

// START: Import Local Files
import styles from './DenominationSwitch.module.css';
import { TokenPairIF } from '../../../utils/interfaces/TokenPairIF';

// interface for props
interface denominationSwitchProps {
    tokenPair: TokenPairIF;
    isOnTradeRoute?: boolean;
}

export default function DenominationSwitch(props: denominationSwitchProps) {
    const { tokenPair } = props;

    const [toggleDenomination, setToggleDenomination] = useState<boolean>(false);

    // TODO:  @Junior, if both buttons have the same action of reversing the current
    // TODO:  ... value of `toggleDenomination`, let's do just one button with two
    // TODO   ... <div> elements nested inside of it

    // TODO:  right now we have the display set up as TokenA||TokenB with TokenA
    // TODO:  ... selected by default, we may want to change this logic later to
    // TODO:  ... base||quote or to sort according to Doug's moneyness factor

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
