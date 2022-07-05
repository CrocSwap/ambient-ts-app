// START: Import Local Files
import styles from './EditDenominationSwitch.module.css';
// import { TokenPairIF } from '../../../../utils/interfaces/exports';
// import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
// import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';

// interface for props
interface EditDenominationSwitchPropsIF {
    // tokenPair: TokenPairIF;
    // displayForBase: boolean;
    // poolPriceDisplay: number;
    // isOnTradeRoute?: boolean;
    // isTokenABase: boolean;
    denominationsInBase: boolean;
    setDenominationsInBase: React.Dispatch<React.SetStateAction<boolean>>;
}

// TODO:  @Emily poolPriceDisplay is passed here as a prop for the purpose of managing
// TODO:  ... which token to initialize the display too, if it's not necessary in the
// TODO   ... end, please remove the value from props

export default function EditDenominationSwitch(props: EditDenominationSwitchPropsIF) {
    // const { tokenPair, isTokenABase, poolPriceDisplay, didUserFlipDenom } = props;
    const { denominationsInBase, setDenominationsInBase } = props;
    // const dispatch = useAppDispatch();

    // TODO:  @Junior, if both buttons have the same action of reversing the current
    // TODO:  ... value of `toggleDenomination`, let's do just one button with two
    // TODO   ... <div> elements nested inside of it

    // const moreExpensiveToken = poolPriceDisplay < 1
    //     ? (isTokenABase ? 'A' : 'B')
    //     : (isTokenABase ? 'B' : 'A');

    // const tokenToHighlight = moreExpensiveToken === 'A'
    //     ? (didUserFlipDenom ? 'B' : 'A')
    //     : (didUserFlipDenom ? 'A' : 'B');

    // temp data
    // const tokenToHighlight = 'A';

    // For now, I have made this a static file but the code can essentially be taken from DenominationSwitch.tsx and just pass the props fro edit
    // TODO: Eventually, we will want just one denomination switch throughout the entire app instead of rewriting the same code for each component

    return (
        <div className={styles.denomination_switch}>
            <div>Denomination</div>
            <button
                className={
                    // tokenToHighlight === 'A' ? styles.active_button : styles.non_active_button
                    denominationsInBase ? styles.active_button : styles.non_active_button
                }
                onClick={() => setDenominationsInBase(!denominationsInBase)}
                // onClick={() => dispatch(toggleDidUserFlipDenom())}
            >
                {'ETH'}
            </button>
            <button
                className={!denominationsInBase ? styles.active_button : styles.non_active_button}
                onClick={() => setDenominationsInBase(!denominationsInBase)}
            >
                {'DAI'}
            </button>
        </div>
    );
}
