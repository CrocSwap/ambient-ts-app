// import { ChangeEvent } from 'react';
import styles from './LimitCurrencyQuantity.module.css';

interface LimitCurrencyQuantityProps {
    disable?: boolean;
    fieldId: string;
    // updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
}

export default function LimitCurrencyQuantity(props: LimitCurrencyQuantityProps) {
    const { disable, fieldId } = props;

    return (
        <div className={styles.token_amount}>
            <input
                id={`${fieldId}-limit-quantity`}
                className={styles.currency_quantity}
                placeholder='0.0'
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
}
