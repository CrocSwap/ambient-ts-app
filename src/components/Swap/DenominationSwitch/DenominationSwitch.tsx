// START: Import React and Dongles
import { useMemo } from 'react';

// START: Import Local Files
import styles from './DenominationSwitch.module.css';
import { TokenPairIF } from '../../../utils/interfaces/exports';
import {
    useAppDispatch,
    useAppSelector
} from '../../../utils/hooks/reduxToolkit';
import {
    // toggleDenomInBase,
    toggleDidUserFlipDenom
} from '../../../utils/state/tradeDataSlice';

// interface for props
interface denominationSwitchPropsIF {
    tokenPair: TokenPairIF;
    displayForBase: boolean;
    poolPriceDisplay: number;
    isOnTradeRoute?: boolean;
    isTokenABase: boolean;
}

// TODO:  @Emily poolPriceDisplay is passed here as a prop for the purpose of managing
// TODO:  ... which token to initialize the display too, if it's not necessary in the
// TODO   ... end, please remove the value from props

export default function DenominationSwitch(props: denominationSwitchPropsIF) {
    const { tokenPair, isTokenABase, poolPriceDisplay } = props;

    const { didUserFlipDenom } = useAppSelector(state => state.tradeData);

    const dispatch = useAppDispatch();

    // TODO:  @Junior, if both buttons have the same action of reversing the current
    // TODO:  ... value of `toggleDenomination`, let's do just one button with two
    // TODO   ... <div> elements nested inside of it

    const buttonTokenA = useMemo(() => {
        const moreExpensiveToken = poolPriceDisplay < 1
            ? (isTokenABase ? 'A' : 'B')
            : (isTokenABase ? 'B' : 'A');

        const tokenToHighlight = moreExpensiveToken === 'A'
            ? (didUserFlipDenom ? 'B' : 'A')
            : (didUserFlipDenom ? 'A' : 'B');

        return (
            <button
                className={
                    tokenToHighlight === 'A'
                        ? styles.active_button
                        : styles.non_active_button
                }
                onClick={() => dispatch(toggleDidUserFlipDenom())}
            >
                {tokenPair.dataTokenA.symbol}
            </button>
        );
    }, [tokenPair]);

    const buttonTokenB = useMemo(() => {
        const moreExpensiveToken = poolPriceDisplay < 1
        ? (isTokenABase ? 'A' : 'B')
        : (isTokenABase ? 'B' : 'A');

    const tokenToHighlight = moreExpensiveToken === 'A'
        ? (didUserFlipDenom ? 'B' : 'A')
        : (didUserFlipDenom ? 'A' : 'B');

        return (
            <button
                className={
                    tokenToHighlight === 'B'
                        ? styles.active_button
                        : styles.non_active_button
                }
                onClick={() => dispatch(toggleDidUserFlipDenom())}
            >
                {tokenPair.dataTokenB.symbol}
            </button>
        );
    }, [tokenPair]);

    return (
        <div className={styles.denomination_switch}>
            <div>Denomination</div>
            {buttonTokenA}
            {buttonTokenB}
        </div>
    );
}
