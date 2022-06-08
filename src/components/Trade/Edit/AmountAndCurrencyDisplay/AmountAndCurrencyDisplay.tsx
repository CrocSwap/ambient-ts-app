import styles from './AmountAndCurrencyDisplay.module.css';

interface AmountAndCurrencyDisplayProps {
    value: string | number;
    tokenImg: string;
}

export default function AmountAndCurrencyDisplay(props: AmountAndCurrencyDisplayProps) {
    const { value, tokenImg } = props;
    const currencyQuantity = (
        <div className={styles.token_amount}>
            <input
                // id={`${fieldId}-range-quantity`}
                className={styles.currency_quantity}
                placeholder='0.0'
                // onChange={(e) => updateOtherQuantity(e)}
                type='string'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                pattern='^[0-9]*[.,]?[0-9]*$'
                disabled
                required
                value={value}
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
                        alt='ethreum'
                        width='30px'
                    />
                    <span className={styles.token_list_text}>ETH</span>
                </div>
            </div>
            <div className={styles.swapbox_bottom}>
                <span>Wallet: 69.420 | DEX: 0.00</span>
                Dex Balance
            </div>
        </div>
    );
}
