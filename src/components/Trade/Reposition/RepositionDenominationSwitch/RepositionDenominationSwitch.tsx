// START: Import Local Files
import { useAppDispatch, useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import {
    // setDenomInBase,
    toggleDidUserFlipDenom,
} from '../../../../utils/state/tradeDataSlice';
import styles from './RepositionDenominationSwitch.module.css';
// import { TokenPairIF } from '../../../../utils/interfaces/exports';
// import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
// import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';

// interface for props
interface RepositionDenominationSwitchPropsIF {
    quoteTokenSymbol: string;
    baseTokenSymbol: string;
}

// TODO:  @Emily poolPriceDisplay is passed here as a prop for the purpose of managing
// TODO:  ... which token to initialize the display too, if it's not necessary in the
// TODO   ... end, please remove the value from props

export default function RepositionDenominationSwitch(props: RepositionDenominationSwitchPropsIF) {
    const { baseTokenSymbol, quoteTokenSymbol } = props;
    // const dispatch = useAppDispatch();

    // -------------------------------TEMP DATA-----------------------

    // ------------------------------- END OF TEMP DATA-----------------------

    const dispatch = useAppDispatch();

    const isDenomBase = useAppSelector((state) => state.tradeData)?.isDenomBase;

    return (
        <div className={styles.denomination_switch}>
            {/* <div>Denomination</div> */}
            <button
                className={!isDenomBase ? styles.active_button : styles.non_active_button}
                onClick={() => {
                    dispatch(toggleDidUserFlipDenom());

                    // dispatch(setDenomInBase(!isDenomBase));
                }}
                // onClick={() => setIsDenomBaseLocal(!isDenomBaseLocal)}
            >
                {baseTokenSymbol}
            </button>
            <button
                className={isDenomBase ? styles.active_button : styles.non_active_button}
                // onClick={() => setIsDenomBaseLocal(!isDenomBaseLocal)}
                onClick={() => {
                    dispatch(toggleDidUserFlipDenom());
                    // dispatch(setDenomInBase(!isDenomBase));
                }}
            >
                {quoteTokenSymbol}
            </button>
        </div>
    );
}
