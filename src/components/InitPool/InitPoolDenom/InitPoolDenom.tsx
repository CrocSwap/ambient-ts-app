// START: Import Local Files
import styles from './InitPoolDenom.module.css';
// import { TokenPairIF } from '../../../utils/interfaces/exports';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
// import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
import { Dispatch, SetStateAction } from 'react';

// interface for props
interface InitPoolDenomPropsIF {
    setIsDenomBase: Dispatch<SetStateAction<boolean>>;
    isDenomBase: boolean;
    invertInitialPrice: () => void;
    // tokenPair: TokenPairIF;
    // denominationsInBase: boolean;
    // poolPriceDisplay: number | undefined;
    // isOnTradeRoute?: boolean;
    // isTokenABase: boolean;
    // didUserFlipDenom: boolean;
}

// TODO:  @Emily poolPriceDisplay is passed here as a prop for the purpose of managing
// TODO:  ... which token to initialize the display too, if it's not necessary in the
// TODO   ... end, please remove the value from props

export default function InitPoolDenom(props: InitPoolDenomPropsIF) {
    // const { tokenPair, isTokenABase, poolPriceDisplay, didUserFlipDenom } = props;
    const { isDenomBase, setIsDenomBase, invertInitialPrice } = props;
    // const dispatch = useAppDispatch();

    const tradeData = useAppSelector((state) => state.tradeData);

    // const isDenomBase = tradeData.isDenomBase;
    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

    // TODO:  @Junior, if both buttons have the same action of reversing the current
    // TODO:  ... value of `toggleDenomination`, let's do just one button with two
    // TODO   ... <div> elements nested inside of it

    return (
        <div className={styles.denomination_switch}>
            <button
                className={!isDenomBase ? styles.active_button : styles.non_active_button}
                onClick={() => {
                    invertInitialPrice();
                    setIsDenomBase(!isDenomBase);
                }}
            >
                {baseTokenSymbol}
            </button>
            <button
                className={isDenomBase ? styles.active_button : styles.non_active_button}
                onClick={() => {
                    invertInitialPrice();
                    setIsDenomBase(!isDenomBase);
                }}
            >
                {quoteTokenSymbol}
            </button>
        </div>
    );
}
