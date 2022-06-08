import styles from './CurrencyDisplay.module.css';
import { RiArrowDownSLine } from 'react-icons/ri';

// interface CurrencyDisplayProps {
//     children: React.ReactNode;
// }

export default function CurrencyDisplay() {
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
            />
        </div>
    );
    return (
        <div className={styles.swapbox}>
            {/* {sellToken && <span className={styles.direction}>Amounts</span>} */}
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input}>{currencyQuantity}</div>
                <div className={styles.token_select}>
                    <img
                        className={styles.token_list_img}
                        src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png'
                        alt='ethreum'
                        width='30px'
                    />
                    <span className={styles.token_list_text}>ETH</span>
                    <RiArrowDownSLine size={27} />
                </div>
            </div>
            <div className={styles.swapbox_bottom}>
                <span>Wallet: 69.420 | DEX: 0.00</span>
                {/* {DexBalanceContent} */}
            </div>
            {/* {tokenSelectModalOrNull} */}
        </div>
    );
}
