// START: Import Local Files
import styles from './DenominationSwitch.module.css';
// import { TokenPairIF } from '../../../utils/interfaces/exports';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
import { memo } from 'react';

// interface for props
// interface denominationSwitchPropsIF {
//     // tokenPair: TokenPairIF;
//     // denominationsInBase: boolean;
//     // poolPriceDisplay: number | undefined;
//     // isOnTradeRoute?: boolean;
//     // isTokenABase: boolean;
//     // didUserFlipDenom: boolean;
// }

// TODO:  @Emily poolPriceDisplay is passed here as a prop for the purpose of managing
// TODO:  ... which token to initialize the display too, if it's not necessary in the
// TODO   ... end, please remove the value from props

function DenominationSwitch() {
    // const { tokenPair, isTokenABase, poolPriceDisplay, didUserFlipDenom } = props;

    const dispatch = useAppDispatch();

    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase = tradeData.isDenomBase;
    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

    // TODO:  @Junior, if both buttons have the same action of reversing the current
    // TODO:  ... value of `toggleDenomination`, let's do just one button with two
    // TODO   ... <div> elements nested inside of it

    return (
        <div className={styles.denomination_switch}>
            <button
                className={
                    !isDenomBase
                        ? styles.active_button
                        : styles.non_active_button
                }
                onClick={(e) => {
                    dispatch(toggleDidUserFlipDenom());
                    e.stopPropagation();
                }}
            >
                {baseTokenSymbol}
            </button>
            <button
                className={
                    isDenomBase
                        ? styles.active_button
                        : styles.non_active_button
                }
                onClick={(e) => {
                    dispatch(toggleDidUserFlipDenom());
                    e.stopPropagation();
                }}
            >
                {quoteTokenSymbol}
            </button>
        </div>
    );
}

export default memo(DenominationSwitch);
