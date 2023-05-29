// START: Import Local Files
import styles from './InitPoolDenom.module.css';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { Dispatch, SetStateAction } from 'react';

// interface for props
interface propsIF {
    setIsDenomBase: Dispatch<SetStateAction<boolean>>;
    isDenomBase: boolean;
    invertInitialPrice?: () => void;
}

export default function InitPoolDenom(props: propsIF) {
    const { isDenomBase, setIsDenomBase, invertInitialPrice } = props;
    const tradeData = useAppSelector((state) => state.tradeData);

    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

    return (
        <div className={styles.denomination_switch}>
            <button
                className={
                    !isDenomBase
                        ? styles.active_button
                        : styles.non_active_button
                }
                onClick={() => {
                    invertInitialPrice ? invertInitialPrice() : null;
                    setIsDenomBase(!isDenomBase);
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
                onClick={() => {
                    invertInitialPrice ? invertInitialPrice() : null;
                    setIsDenomBase(!isDenomBase);
                }}
            >
                {quoteTokenSymbol}
            </button>
        </div>
    );
}
