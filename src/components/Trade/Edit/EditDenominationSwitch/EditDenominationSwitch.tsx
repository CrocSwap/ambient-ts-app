// START: Import Local Files
import styles from './EditDenominationSwitch.module.css';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';

// interface for props
interface EditDenominationSwitchPropsIF {
    denominationsInBase: boolean;
    quoteTokenSymbol: string;
    baseTokenSymbol: string;
}

// TODO:  @Emily poolPriceDisplay is passed here as a prop for the purpose of managing
// TODO:  ... which token to initialize the display too, if it's not necessary in the
// TODO   ... end, please remove the value from props

export default function EditDenominationSwitch(props: EditDenominationSwitchPropsIF) {
    const { denominationsInBase, baseTokenSymbol, quoteTokenSymbol } = props;
    const dispatch = useAppDispatch();

    return (
        <div className={styles.denomination_switch}>
            <div>Denomination</div>
            <button
                className={denominationsInBase ? styles.active_button : styles.non_active_button}
                onClick={() => dispatch(toggleDidUserFlipDenom())}
            >
                {baseTokenSymbol}
            </button>
            <button
                className={!denominationsInBase ? styles.active_button : styles.non_active_button}
                onClick={() => dispatch(toggleDidUserFlipDenom())}
            >
                {quoteTokenSymbol}
            </button>
        </div>
    );
}
