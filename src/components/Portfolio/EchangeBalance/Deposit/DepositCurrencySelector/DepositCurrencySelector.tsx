import styles from './DepositCurrencySelector.module.css';
import { RiArrowDownSLine } from 'react-icons/ri';
import { TokenIF } from '../../../../../utils/interfaces/TokenIF';

interface DepositCurrencySelectorProps {
    fieldId: string;
    onClick: () => void;

    sellToken?: boolean;
    disable?: boolean;
    tempTokenSelection: TokenIF;
    // updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
}

export default function DepositCurrencySelector(props: DepositCurrencySelectorProps) {
    const { fieldId, disable, onClick, tempTokenSelection } = props;

    const rateInput = (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-exchange-balance-deposit-quantity`}
                className={styles.currency_quantity}
                placeholder='0'
                // onChange={(event) => updateOtherQuantity(event)}
                type='string'
                inputMode='decimal'
                autoComplete='off'
                autoCorrect='off'
                min='0'
                minLength={1}
                pattern='^[0-9]*[.,]?[0-9]*$'
                disabled={disable}
                required
            />
        </div>
    );

    return (
        <div className={styles.swapbox}>
            <span className={styles.direction}>Select Token</span>
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input}>{rateInput}</div>
                <div className={styles.token_select} onClick={onClick}>
                    <img
                        className={styles.token_list_img}
                        src={tempTokenSelection.logoURI}
                        alt={tempTokenSelection.name}
                        width='30px'
                    />
                    <span className={styles.token_list_text}>{tempTokenSelection.symbol}</span>
                    <RiArrowDownSLine size={27} />
                </div>
            </div>
        </div>
    );
}
