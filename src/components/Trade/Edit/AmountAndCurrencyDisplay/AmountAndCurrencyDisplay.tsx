import { decimalNumRegEx } from '../../../../utils/regex/exports';
import styles from './AmountAndCurrencyDisplay.module.css';

interface AmountAndCurrencyDisplayProps {
    tokenImg: string;
    qty: string;
    symbol: string;
    fieldId: string;
    disable?: boolean;
}

export default function AmountAndCurrencyDisplay(
    props: AmountAndCurrencyDisplayProps,
) {
    const { tokenImg, qty, symbol, fieldId, disable } = props;
    const currencyQuantity = (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-edit-range-quantity`}
                className={styles.currency_quantity}
                placeholder='0.0'
                type='string'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                pattern={decimalNumRegEx.toString()}
                disabled={disable}
                defaultValue={qty}
            />
        </div>
    );
    return (
        <div className={styles.swapbox}>
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input}>{currencyQuantity}</div>
                <div className={styles.token_select}>
                    <img
                        className={styles.token_list_img}
                        src={tokenImg}
                        alt={symbol}
                        width='30px'
                    />
                    <span className={styles.token_list_text}>{symbol}</span>
                </div>
            </div>
            <div className={styles.swapbox_bottom}>
                <span>Wallet: 69.420 | DEX: 0.00</span>
                Dex Balance
            </div>
        </div>
    );
}
