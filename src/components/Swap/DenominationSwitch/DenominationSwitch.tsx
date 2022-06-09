// START: Import Local Files
import styles from './DenominationSwitch.module.css';
import { TokenPairIF } from '../../../utils/interfaces/exports';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { setDenomInBase } from '../../../utils/state/tradeDataSlice';

// interface for props
interface denominationSwitchPropsIF {
    tokenPair: TokenPairIF;
    displayForBase: boolean;
    poolPriceDisplay: number;
    isOnTradeRoute?: boolean;
}

// TODO:  @Emily poolPriceDisplay is passed here as a prop for the purpose of managing
// TODO:  ... which token to initialize the display too, if it's not necessary in the
// TODO   ... end, please remove the value from props

export default function DenominationSwitch(props: denominationSwitchPropsIF) {
    const { tokenPair, displayForBase } = props;

    const dispatch = useAppDispatch();

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
                className={displayForBase ? styles.active_button : styles.non_active_button}
                onClick={() => dispatch(setDenomInBase(true))}
            >
                {tokenPair.dataTokenA.symbol}
            </button>

            <button
                className={!displayForBase ? styles.active_button : styles.non_active_button}
                onClick={() => dispatch(setDenomInBase(false))}
            >
                {tokenPair.dataTokenB.symbol}
            </button>
        </div>
    );
}
