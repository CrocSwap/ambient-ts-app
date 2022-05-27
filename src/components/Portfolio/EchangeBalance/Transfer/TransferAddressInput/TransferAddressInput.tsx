import styles from './TransferAddressInput.module.css';
import { RiArrowDownSLine } from 'react-icons/ri';

interface TransferAddressInputProps {
    fieldId: string;

    sellToken?: boolean;
    disable?: boolean;

    // updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
}

export default function TransferAddressInput(props: TransferAddressInputProps) {
    const { fieldId, disable } = props;

    const rateInput = (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-exchange-balance-transfer-quantity`}
                className={styles.currency_quantity}
                placeholder='Enter address... '
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
            <span className={styles.direction}>To</span>
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input}>{rateInput}</div>
            </div>
        </div>
    );
}
